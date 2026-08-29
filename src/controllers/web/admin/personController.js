export const getPersonsPage = async (req, res) => {

    const { user } = req;

    return res.render('pages/admin/persons/personsPage', {
        currentRoute: '/personas',
        user
    });
}
