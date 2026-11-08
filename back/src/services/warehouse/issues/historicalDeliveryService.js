import { createHash, randomUUID } from 'node:crypto';
import { getDb } from '../../../repository/baseRepository.js';
import { AppError } from '../../../errors/AppError.js';
import { OperationKeyConflictError, RecordVersionConflictError } from '../../../errors/concurrencyError.js';
import { UUID_V4_PATTERN } from '../../../shared/constants/inputValidation.js';
import { isDateTime } from '../../../shared/validation/baseValidations.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';
import { FULFILLMENT_STATUS_NAMES, GOODS_ISSUE_STATUS_NAMES } from '../../../constants/warehouseStatuses.js';
import { normalizeDecimal } from '../../../shared/utils/numberUtils.js';
import { lockHistoricalDeliveryDocuments } from '../../../repository/warehouse/historicalDeliveryRepository.js';
import { updateGoodsIssueDetails, updateWasteIssueDetails } from '../../../repository/warehouse/issueDetailRepository.js';
import { buildGoodsIssueContextWhere } from '../goodsIssues/goodsIssueHelpers.js';
import { findFulfillmentStatusIdsByName } from '../fulfillmentStatusService.js';
import { buildIssueDepartmentWhere } from './issueAccessService.js';
import { assertIssueNotCanceled, resolveIssueFulfillmentStatus } from './issueFulfillmentRules.js';

const pendingStatuses = [FULFILLMENT_STATUS_NAMES.PENDING, FULFILLMENT_STATUS_NAMES.PARTIAL];
const json = value => JSON.parse(JSON.stringify(value));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const invalid = message => new AppError(message, 'HISTORICAL_DELIVERY_VALIDATION', 400);
const include = { status: true, fulfillmentStatus: true,
    details: { orderBy: { id: 'asc' }, include: { fulfillmentStatus: true } } };
const model = (db, resource) => resource === 'wastes' ? db.wasteIssue : db.goodsIssue;
const authorize = (user, resource) => {
    if (!['materials', 'consumables', 'wastes'].includes(resource)) throw invalid('El módulo no es válido.');
    if (!user?.permissions?.includes(PERMISSIONS.ISSUES_RECONCILE)) {
        throw new AppError('No tiene permiso para reconocer entregas históricas.', 'FORBIDDEN', 403);
    }
};
const date = value => {
    if (typeof value !== 'string' || isDateTime(value, 'Fecha') || !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
        throw invalid('Captura una fecha con hora y zona horaria válidas.');
    }
    return new Date(value);
};
const cutoff = value => {
    const result = date(value);
    if (result > new Date()) throw invalid('El corte no puede estar en el futuro.');
    return result;
};
const contextWhere = (resource, user) => ({
    ...(resource !== 'wastes' && buildGoodsIssueContextWhere(resource === 'materials' ? 'MATERIAL' : 'CONSUMABLE')),
    ...buildIssueDepartmentWhere({ accesses: user.accesses })
});
const activeDetails = issue => issue.details.filter(detail => detail.fulfillmentStatus.name !== FULFILLMENT_STATUS_NAMES.CANCELED);
const pendingDetails = issue => activeDetails(issue).filter(detail => !detail.isSupplied
    && normalizeDecimal(Number(detail.quantity) - Number(detail.suppliedQuantity ?? 0)) > 0);
const revision = issue => hash(json(issue));
const candidate = issue => ({ id: issue.id, revision: revision(issue), referenceNumber: issue.referenceNumber,
    requestDate: issue.requestDate, departmentName: issue.departmentName, projectNumber: issue.projectNumber,
    details: pendingDetails(issue).map(detail => ({ id: detail.id, name: detail.materialName,
        quantity: Number(detail.quantity), suppliedQuantity: Number(detail.suppliedQuantity ?? 0),
        returnedQuantity: Number(detail.returnedQuantity),
        pendingQuantity: normalizeDecimal(Number(detail.quantity) - Number(detail.suppliedQuantity ?? 0)) })) });

export const previewHistoricalDeliveries = async ({ user, resource, query = {} }) => {
    authorize(user, resource);
    const cutoffDate = cutoff(query.cutoffDate);
    const page = Number(query.page ?? 1);
    const search = query.search ?? '';
    if (!Number.isInteger(page) || page < 1 || page > 999 || typeof search !== 'string' || search.length > 200) throw invalid('Revisa la búsqueda y la página.');
    const issues = await model(getDb(), resource).findMany({ where: { ...contextWhere(resource, user),
        historicalDeliveryBatchId: null, requestDate: { lte: cutoffDate },
        status: { name: { not: GOODS_ISSUE_STATUS_NAMES.CANCELED } }, fulfillmentStatus: { name: { in: pendingStatuses } },
        ...(search && { OR: [{ referenceNumber: { contains: search, mode: 'insensitive' } }, { projectNumber: { contains: search, mode: 'insensitive' } }] })
    }, include, orderBy: [{ requestDate: 'asc' }, { id: 'asc' }], skip: (page - 1) * 100, take: 101 });
    return { resource, cutoffDate, page, hasMore: issues.length > 100,
        documents: issues.slice(0, 100).filter(issue => pendingDetails(issue).length).map(candidate) };
};

const normalizeCommand = command => {
    const { operationId, documents, declaredDelivered } = command;
    if (!UUID_V4_PATTERN.test(operationId ?? '') || declaredDelivered !== true || !Array.isArray(documents)
        || !documents.length || documents.length > 100
        || documents.some(item => !UUID_V4_PATTERN.test(item?.id ?? '') || !/^[a-f0-9]{64}$/.test(item?.revision ?? ''))
        || new Set(documents.map(item => item.id)).size !== documents.length) throw invalid('Selecciona de 1 a 100 salidas distintas y declara su entrega física completa.');
    const reason = typeof command.reason === 'string' ? command.reason.trim() : '';
    if (typeof reason !== 'string' || !reason || Array.from(reason).length > 500) throw invalid('Describe el motivo de la regularización (hasta 500 caracteres).');
    const cutoffDate = cutoff(command.cutoffDate);
    const deliveredAt = command.deliveredAt ? date(command.deliveredAt) : null;
    if (deliveredAt && deliveredAt > cutoffDate) throw invalid('La entrega debe ser anterior o igual al corte.');
    return { operationId, reason, cutoffDate, deliveredAt, declaredDelivered: true,
        documents: documents.map(({ id, revision: value }) => ({ id, revision: value })).sort((a, b) => a.id.localeCompare(b.id)) };
};

export const confirmHistoricalDeliveries = async ({ user, resource, command }) => {
    authorize(user, resource);
    const capture = normalizeCommand(command);
    const commandHash = hash({ resource, ...capture });
    try {
        return await getDb().$transaction(async tx => {
            await tx.$executeRaw`SET LOCAL lock_timeout = '1500ms'`;
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${user.id}:${capture.operationId}:historical-delivery`}, 0))`;
            const receipt = await tx.historicalDeliveryBatch.findUnique({ where: { userId_operationId: { userId: user.id, operationId: capture.operationId } } });
            if (receipt) {
                if (receipt.commandHash !== commandHash) throw new OperationKeyConflictError();
                return { receipt: receipt.result, replayed: true };
            }
            await lockHistoricalDeliveryDocuments({ tx, resource, ids: capture.documents.map(item => item.id) });
            const issues = await model(tx, resource).findMany({ where: { ...contextWhere(resource, user), id: { in: capture.documents.map(item => item.id) } }, include, orderBy: { id: 'asc' } });
            if (issues.length !== capture.documents.length) throw new AppError('Una salida no existe o no pertenece al alcance autorizado.', 'NOT_FOUND', 404);
            const statusIds = await findFulfillmentStatusIdsByName({ tx, names: Object.values(FULFILLMENT_STATUS_NAMES) });
            if (!statusIds.get(FULFILLMENT_STATUS_NAMES.COMPLETE)) throw invalid('Falta configurar el estado Surtido.');
            const result = { id: randomUUID(), resource, cutoffDate: capture.cutoffDate, deliveredAt: capture.deliveredAt,
                reason: capture.reason, registeredAt: new Date(), registeredBy: user.name ?? user.id,
                declaredDelivered: true, costsVerified: false, documents: [] };
            // Se revisa todo el lote antes de escribir. Los bloqueos son los mismos de surtido, edición y devolución.
            for (let index = 0; index < issues.length; index++) {
                const issue = issues[index];
                if (revision(issue) !== capture.documents[index].revision) throw new RecordVersionConflictError();
                assertIssueNotCanceled(issue);
                if (issue.historicalDeliveryBatchId || issue.requestDate > capture.cutoffDate
                    || !pendingStatuses.includes(issue.fulfillmentStatus?.name) || !pendingDetails(issue).length
                    || (capture.deliveredAt && capture.deliveredAt < issue.requestDate)) {
                    throw new AppError('La salida no tiene pendientes elegibles para este corte.', 'HISTORICAL_DELIVERY_CONFLICT', 409);
                }
                result.documents.push({ ...candidate(issue), before: json(issue),
                    recognized: pendingDetails(issue).map(detail => ({ detailId: detail.id,
                        quantity: normalizeDecimal(Number(detail.quantity) - Number(detail.suppliedQuantity ?? 0)) })),
                    fulfillmentStatus: FULFILLMENT_STATUS_NAMES.COMPLETE });
            }
            const { operationId, cutoffDate, deliveredAt, reason } = capture;
            await tx.historicalDeliveryBatch.create({ data: { id: result.id, userId: user.id, operationId, resource,
                commandHash, cutoffDate, deliveredAt, reason, result: json(result) } });
            for (const issue of issues) {
                const details = pendingDetails(issue).map(detail => ({ ...detail, suppliedQuantity: detail.quantity,
                    isSupplied: true, fulfillmentStatusId: statusIds.get(FULFILLMENT_STATUS_NAMES.COMPLETE) }));
                const write = resource === 'wastes' ? updateWasteIssueDetails : updateGoodsIssueDetails;
                if (await write({ tx, id: issue.id, details }) !== details.length) throw new RecordVersionConflictError();
                const changed = new Map(details.map(detail => [detail.id, detail]));
                const fulfillment = resolveIssueFulfillmentStatus(activeDetails(issue).map(detail => changed.get(detail.id) ?? detail));
                await model(tx, resource).update({ where: { id: issue.id }, data: {
                    historicalDeliveryBatchId: result.id, fulfillmentStatusId: statusIds.get(fulfillment)
                } });
            }
            return { receipt: json(result), replayed: false };
        }, { maxWait: 1500, timeout: 30000 });
    } catch (error) {
        if (error.code === 'P2028' || ['55P03', '57014', '40P01'].includes(error.meta?.code)) {
            throw new AppError('Otra operación está modificando estas salidas. Reintenta con la misma clave.', 'HISTORICAL_DELIVERY_BUSY', 409);
        }
        throw error;
    }
};
