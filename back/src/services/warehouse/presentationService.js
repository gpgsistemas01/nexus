import { findPage } from "../../repository/paginationRepository.js";
import { PresentationNotFound } from "../../errors/warehouse/presentationError.js";
import { getDb } from "../../repository/baseRepository.js";

export const findAllPresentations = async ({
    skip = 0,
    take = 10,
    search = '',
    orderBy = 'name',
    orderDir = 'asc'
}) => {

    const where = {
        isActive: true,
        ...(search && {
            name: {
                contains: search,
                mode: 'insensitive'
            }
        })
    };

    return findPage({
        model: getDb().presentation,
        query: {
            skip,
            take,
            where,
            orderBy: {
                [orderBy]: orderDir
            },
            select: {
                id: true,
                name: true,
                isActive: true
            }
        }
    });
}

const DEFAULT_PRESENTATION_SELECT = {
    id: true,
    name: true,
    isActive: true
};

export const findUniquePresentation = async ({
    tx,
    id
}) => {

    const db = getDb(tx);
    const presentation = await db.presentation.findFirst({
        where: { id, isActive: true },
        select: DEFAULT_PRESENTATION_SELECT
    });

    if (!presentation) throw new PresentationNotFound();

    return presentation;
}
