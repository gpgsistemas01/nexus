import { UnitMeasureFindDatabaseError, UnitMeasureNotFound } from "../../errors/warehouse/unitMeasureError.js";
import { prisma } from "../../lib/prisma.js";

export const findAllUnitMeasures = async ({
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'name',
    orderDir = 'asc'
}) => {

    const where = search
        ? {
            name: {
                contains: search,
                mode: 'insensitive'
            }
        }
        : {};

    const units = await prisma.unitMeasure.findMany({
        skip,
        take,
        where,
        orderBy: {
            [orderBy]: orderDir
        }
    });

    const total = await prisma.unitMeasure.count();
    const filtered = await prisma.unitMeasure.count({ where });

    return {
        data: units,
        recordsTotal: total,
        recordsFiltered: filtered
    };
}

export const findUniqueUnitMeasure = async ({
    tx,
    id
}) => {

    const db = tx || prisma;
    let unit;

    try {

        unit = await db.unitMeasure.findUnique({
            where: { id },
            select: { id: true }
        });

    } catch (err) {

        throw new UnitMeasureFindDatabaseError();
    }

    if (!unit) throw new UnitMeasureNotFound();

    return unit;
}