import { successCodeMessages } from '../../messages/codeMessages.js';
import { createCatalogEntry, deleteCatalogEntry, updateCatalogEntry } from '../../services/catalogAdministrationService.js';

export const createCatalogMutationControllers = ({ catalog }) => ({
    register: async (req, res) => {
        const entry = await createCatalogEntry({ catalog, data: req.body });
        return res.status(201).json({ entry, code: successCodeMessages.CREATED_CATALOG_ENTRY });
    },
    edit: async (req, res) => {
        const entry = await updateCatalogEntry({ catalog, id: req.params.id, data: req.body });
        return res.status(200).json({ entry, code: successCodeMessages.UPDATED_CATALOG_ENTRY });
    },
    remove: async (req, res) => {
        await deleteCatalogEntry({ catalog, id: req.params.id });
        return res.status(200).json({ code: successCodeMessages.DELETED_CATALOG_ENTRY });
    }
});
