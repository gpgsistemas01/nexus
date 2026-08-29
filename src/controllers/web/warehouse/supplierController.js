export const getSuppliersPage = async (req, res) => {

    const { user } = req;

    return res.render('pages/warehouse/suppliers/suppliersPage', {
        currentRoute: '/proveedores',
        user
    });
}
