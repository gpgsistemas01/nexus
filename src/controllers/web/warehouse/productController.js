export const getProductsPage = async (req, res) => {

    const { user } = req;

    return res.render('pages/warehouse/products/productsPage', {
        currentRoute: '/productos',
        user
    });
}