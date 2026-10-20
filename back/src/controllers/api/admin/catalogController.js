import { successCodeMessages } from '../../../messages/codeMessages.js';
import {
    createCatalogEntry,
    findAllCatalogEntries,
    updateCatalogEntry
} from '../../../services/admin/catalogService.js';
import { getDataTablePaging, getDataTableSearch } from '../../../utils/requestQueryUtils.js';

export const getAllCatalogEntries = async (req, res, next) => {
    try {
        const { skip, take } = getDataTablePaging(req.query);
        const search = getDataTableSearch(req.query);
        const result = await findAllCatalogEntries(req.params.catalog, { skip, take, search });
        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
};

export const registerCatalogEntry = async (req, res, next) => {
    try {
        const data = await createCatalogEntry(req.params.catalog, req.body);
        return res.status(201).json({
            data,
            code: successCodeMessages.CREATED_CATALOG_ENTRY
        });
    } catch (error) {
        return next(error);
    }
};

export const editCatalogEntry = async (req, res, next) => {
    try {
        const data = await updateCatalogEntry(req.params.catalog, req.params.id, req.body);
        return res.status(200).json({
            data,
            code: successCodeMessages.UPDATED_CATALOG_ENTRY
        });
    } catch (error) {
        return next(error);
    }
};
