export const withPiecePresentation = async ({ prisma, model, id }, run) => {
    const item = id ? await prisma[model].findUniqueOrThrow({ where: { id }, select: { presentationId: true } }) : null;
    const existing = await prisma.presentation.findUnique({ where: { name: 'PIEZA' } });
    const presentation = existing ?? await prisma.presentation.create({ data: { name: 'PIEZA' } });

    try {
        if (item) await prisma[model].update({ where: { id }, data: { presentationId: presentation.id } });
        return await run(presentation.id);
    } finally {
        if (item) await prisma[model].update({ where: { id }, data: { presentationId: item.presentationId } });
        if (!existing) await prisma.presentation.delete({ where: { id: presentation.id } });
    }
};
