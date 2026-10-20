export const getWastesPage = async (req, res) => {

    const { user } = req;

    return res.render('pages/warehouse/wastes/wastesPage', {
        currentRoute: '/almacen/mermas',
        user
    });
}
