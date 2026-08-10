export const getMaterialsPage = async (req, res) => {

    const { user } = req;

    return res.render('pages/warehouse/materials/materialsPage', {
        currentRoute: '/almacen/materiales',
        user
    });
}
