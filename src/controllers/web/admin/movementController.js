const renderMovementPage = ({ req, res, context, title }) => {

    const { user } = req;

    return res.render('pages/admin/movements/movementsPage', {
        currentRoute: `/movimientos/${ context }`,
        movementContext: context,
        movementTitle: title,
        user
    });
};

export const getMaterialMovementPage = async (req, res) => renderMovementPage({
    req,
    res,
    context: 'materiales',
    title: 'Movimientos de materiales'
});

export const getWasteMovementPage = async (req, res) => renderMovementPage({
    req,
    res,
    context: 'mermas',
    title: 'Movimientos de merma'
});
