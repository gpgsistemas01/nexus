export const getPurchaseRequisitionsPage = async (req, res) => {

    const { user } = req;

    return res.render('pages/warehouse/purchaseRequisitions/purchaseRequisitionsPage', {
        currentRoute: '/requisiciones',
        user
    });
}