export const getConsumablesPage = async (req, res) => {
    const { user } = req;

    return res.render('pages/warehouse/consumables/consumablesPage', {
        currentRoute: '/almacen/consumibles',
        user
    });
};
