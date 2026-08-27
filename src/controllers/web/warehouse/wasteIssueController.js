export const getWasteIssuesPage = async (req, res) => {

    const { user } = req;

    return res.render('pages/warehouse/wasteIssues/wasteIssuesPage', {
        currentRoute: '/salidas/mermas',
        user
    });
};
