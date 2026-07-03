export const getGoodsIssuesPage = async (req, res) => {

    const { user } = req;

    return res.render('pages/warehouse/goodsIssues/goodsIssuesPage', {
        currentRoute: '/salidas-almacen',
        user
    });
}