// Reutiliza los filtros de tipo y área del listado, sin conteos ni otros documentos.
export const buildDocumentReadHandler = ({ findDocuments, dataKey, NotFound }) => async (req, res) => {
    const { data } = await findDocuments({
        id: req.params.id, skip: 0, take: 1, includeCounts: false,
        includeDetails: true, accesses: req.user?.accesses
    });
    if (!data[0]) throw new NotFound();
    return res.status(200).json({ [dataKey]: data[0] });
};
