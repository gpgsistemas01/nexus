import { PresentationFindDatabaseError, PresentationNotFound } from "../../errors/warehouse/presentationError.js";
import { prisma } from "../../lib/prisma.js";

export const findAllPresentations = async ({
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

    const units = await prisma.presentation.findMany({
        skip,
        take,
        where,
        orderBy: {
            [orderBy]: orderDir
        }
    });

    const total = await prisma.presentation.count();
    const filtered = await prisma.presentation.count({ where });

    return {
        data: units,
        recordsTotal: total,
        recordsFiltered: filtered
    };
}

export const findUniquePresentation = async ({
    tx,
    id
}) => {

    const db = tx || prisma;
    let presentation;

    try {

        presentation = await db.presentation.findUnique({
            where: { id },
            select: { id: true }
        });

    } catch (err) {

        throw new PresentationFindDatabaseError();
    }

    if (!presentation) throw new PresentationNotFound();

    return presentation;
}