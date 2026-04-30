import { SupplierCodeFindDatabaseError, SupplierCodeNotFound, SupplierCreateDatabaseError, SupplierFindDatabaseError, SupplierNotFound, SupplierUpdateDatabaseError } from "../../errors/warehouse/supplierError.js";
import { prisma } from "../../lib/prisma.js";
import { incrementReferenceNumberCounter } from "../document/referenceNumberService.js";

const SUPPLIER_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const numberToSupplierCode = (number) => {

    let current = number + 1;
    let code = '';

    while (current > 0) {
        current -= 1;
        code = SUPPLIER_CODE_ALPHABET[current % 26] + code;
        current = Math.floor(current / 26);
    }

    return code;
};

export const findAllSuppliers = async ({
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'legalName',
    orderDir = 'asc'
}) => {

    const where = search
        ? {
            tradeName: {
                contains: search,
                mode: 'insensitive'
            }
        }
        : {};

    const suppliers = await prisma.supplier.findMany({
        skip,
        take,
        where,
        orderBy: {
            [orderBy]: orderDir
        }
    });

    const total = await prisma.supplier.count();
    const filtered = await prisma.supplier.count({ where });

    return {
        data: suppliers,
        recordsTotal: total,
        recordsFiltered: filtered
    };
};

export const findUniqueSupplier = async ({
    tx,
    id
}) => {

    const db = tx || prisma;
    let supplier;

    try {

        supplier = await db.supplier.findUnique({
            where: { id },
            select: { 
                id: true,
                tradeName: true,
            }
        });

    } catch (err) {

        throw new SupplierFindDatabaseError();
    }

    if (!supplier) throw new SupplierNotFound();

    return supplier;
}

export const findUniqueSupplierCode = async ({
    tx,
    id
}) => {

    const db = tx || prisma;
    let supplier;

    try {

        supplier = await db.supplier.findUnique({
            where: { id },
            select: { code: true }
        });

    } catch (err) {

        throw new SupplierCodeFindDatabaseError();
    }

    if (!supplier) throw new SupplierCodeNotFound();

    return supplier;
}

export const createSupplier = async (supplierDto) => {

    try {

        const supplier = await prisma.$transaction(async (tx) => {

            const counter = await incrementReferenceNumberCounter({
                type: 'PRO',
                tx
            });

            const codeNumber = counter.counter;
            const generatedCode = numberToSupplierCode(codeNumber - 1);

            return tx.supplier.create({
                data: {
                    ...supplierDto,
                    codeNumber,
                    code: generatedCode,
                }
            });
        });

        return supplier;

    } catch (err) {

        throw new SupplierCreateDatabaseError();
    }
};

export const updateSupplier = async (supplierDto, id) => {

    const supplierExists = await prisma.supplier.findUnique({
        where: {
            id
        },
        select: {
            id: true
        }
    });

    if (!supplierExists) throw new SupplierNotFound();

    try {

        const supplier = await prisma.supplier.update({
            data: { ...supplierDto },
            where: {
                id
            }
        });

        return supplier;

    } catch (err) {

        if (err.code === 'P2025') throw new SupplierNotFound();

        throw new SupplierUpdateDatabaseError();
    }
}
