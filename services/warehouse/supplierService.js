import { SupplierCodeFindDatabaseError, SupplierCodeNotFound, SupplierNotFound, SupplierUpdateDatabaseError } from "../../errors/warehouse/supplierError.js";
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
            OR: [
                {
                    code: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    legalName: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    tradeName: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ]
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

export const findUniqueSupplierCode = async ({
    tx,
    id
}) => {

    const db = tx || prisma;

    try {

        const supplier = await db.supplier.findUnique({
            where: { id },
            select: { code: true }
        });

        if (!supplier) throw new SupplierCodeNotFound();

    } catch (err) {

        throw new SupplierCodeFindDatabaseError();
    }
}

export const createSupplier = async (supplierDto) => {

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
