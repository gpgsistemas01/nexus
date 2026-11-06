import { PRISMA_ERROR_CODES } from "../../constants/prisma.js";
import { ReferenceNumberAlreadyExists } from "../../errors/document/referenceNumberError.js";

export const throwIfReferenceNumberAlreadyExists = ({ err, referenceNumber = null }) => {
    if (err?.code !== PRISMA_ERROR_CODES.RECORD_NOT_UNIQUE) return;

    const driverConstraint = err.meta?.driverAdapterError?.cause?.constraint;
    const target = err.meta?.target ?? driverConstraint?.fields ?? driverConstraint?.index;
    const isReferenceNumberTarget = Array.isArray(target)
        ? target.includes('referenceNumber')
        : typeof target === 'string' && target.includes('referenceNumber');

    if (isReferenceNumberTarget) {
        throw new ReferenceNumberAlreadyExists({ referenceNumber });
    }
};

const incrementYearlyReferenceNumberCounter = async ({ type, tx, year, count = 1 }) => {

    return tx.referenceNumberCounter.upsert({
        where: {
            prefix_year: {
                prefix: type,
                year
            }
        },
        update: {
            counter: {
                increment: count
            }
        },
        create: {
            prefix: type,
            year,
            counter: count
        }
    });
}

export const incrementNonYearlyReferenceNumberCounter = async ({ type, tx }) => {

    return tx.referenceNumberCounter.update({
        where: {
            prefix_year: {
                prefix: type,
                year: 0
            }
        },
        data: {
            counter: {
                increment: 1
            }
        }
    });
}

export const generateYearlyReferenceNumber = async ({ type, tx }) => {

    const year = new Date().getFullYear();
    const counter = await incrementYearlyReferenceNumberCounter({
        type,
        tx,
        year
    });

    return `${type}-${year}-${counter.counter.toString().padStart(6, '0')}`;
}

// Reserva un intervalo dentro de la misma tx: un rollback también revierte todos sus folios.
export const reserveYearlyReferenceNumbers = async ({ type, tx, count }) => {
    if (count === 0) return [];
    if (!Number.isInteger(count) || count < 0 || count > 1000) throw new RangeError('Cantidad de folios fuera de rango.');
    const year = new Date().getFullYear();
    const counter = await incrementYearlyReferenceNumberCounter({ type, tx, year, count });
    return Array.from({ length: count }, (_, index) => `${type}-${year}-${String(counter.counter - count + index + 1).padStart(6, '0')}`);
};
