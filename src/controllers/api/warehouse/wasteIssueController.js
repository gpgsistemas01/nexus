import {
    createWasteIssueDetailsDtoForEdit,
    createWasteIssueDtoForEdit,
    createWasteIssueDtoForRegister,
    createWasteIssueHeaderDtoForEdit,
    createWasteIssueDtoForReturn
} from '../../../dtos/wasteIssueDTO.js';
import {
    createWasteIssue,
    findAllWasteIssues,
    updateWasteIssue,
    updateWasteIssueDetails,
    updateWasteIssueHeader
} from '../../../services/warehouse/wasteIssues/wasteIssueService.js';
import { returnWasteIssueDetail } from '../../../services/warehouse/wasteIssues/detailReturns/wasteIssueReturnService.js';
import { sanitizeEmptyStrings } from '../../../utils/formattersUtils.js';
import { successCodeMessages } from '../../../messages/codeMessages.js';
import { emitInventoryUpdated } from '../../../utils/socketUtils.js';
import { getIssueDataTableQuery } from '../../../utils/issueQueryUtils.js';

const DATATABLE_COLUMNS = [
    'referenceNumber',
    'requestDate',
    'departmentName',
    'projectNumber',
    'clientName',
    null,
    'observations',
    null
];

export const getAllWasteIssues = async (req, res) => {

    const query = getIssueDataTableQuery({
        query: req.query,
        columns: DATATABLE_COLUMNS
    });

    const result = await findAllWasteIssues(query);

    return res.status(200).json(result);
};

export const registerWasteIssue = async (req, res) => {

    const wasteIssueDto = createWasteIssueDtoForRegister(req.body);
    const sanitizedWasteIssueDto = sanitizeEmptyStrings(wasteIssueDto);

    const wasteIssue = await createWasteIssue({
        wasteIssueDto: sanitizedWasteIssueDto,
        userId: req.user.id
    });

    return res.status(201).json({
        wasteIssue,
        code: successCodeMessages.CREATED_WASTE_ISSUE
    });
};

export const editWasteIssue = async (req, res) => {

    const wasteIssueDto = createWasteIssueDtoForEdit(req.body);
    const sanitizedWasteIssueDto = sanitizeEmptyStrings(wasteIssueDto);

    const wasteIssue = await updateWasteIssue({
        id: req.params.id,
        wasteIssueDto: sanitizedWasteIssueDto
    });

    return res.status(200).json({
        wasteIssue,
        code: successCodeMessages.UPDATED_WASTE_ISSUE
    });
};

export const editWasteIssueHeader = async (req, res) => {

    const wasteIssueDto = createWasteIssueHeaderDtoForEdit(req.body);
    const sanitizedWasteIssueDto = sanitizeEmptyStrings(wasteIssueDto);

    const wasteIssue = await updateWasteIssueHeader({
        id: req.params.id,
        wasteIssueDto: sanitizedWasteIssueDto
    });

    return res.status(200).json({
        wasteIssue,
        code: successCodeMessages.UPDATED_WASTE_ISSUE
    });
};

export const editWasteIssueDetails = async (req, res) => {

    const wasteIssueDto = createWasteIssueDetailsDtoForEdit(req.body);
    const sanitizedWasteIssueDto = sanitizeEmptyStrings(wasteIssueDto);

    const wasteIssue = await updateWasteIssueDetails({
        id: req.params.id,
        wasteIssueDto: sanitizedWasteIssueDto
    });

    emitInventoryUpdated({ context: 'waste', source: 'waste-issue-supplied' });

    return res.status(200).json({
        wasteIssue,
        code: successCodeMessages.UPDATED_WASTE_ISSUE
    });
};

export const registerWasteIssueDetailReturn = async (req, res) => {

    const returnDto = sanitizeEmptyStrings(createWasteIssueDtoForReturn(req.body));
    const wasteIssueReturn = await returnWasteIssueDetail({
        id: req.params.id,
        detailId: req.params.detailId,
        returnDto,
        userId: req.user.id
    });

    emitInventoryUpdated({ context: 'waste', source: 'waste-issue-return-created' });

    return res.status(200).json({
        wasteIssueReturn,
        code: successCodeMessages.UPDATED_WASTE_ISSUE
    });
};
