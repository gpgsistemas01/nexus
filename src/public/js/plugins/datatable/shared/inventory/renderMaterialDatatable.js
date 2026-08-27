import { DATATABLE_SELECTORS } from "../../../../constants/selectors.js";
import { refreshDataTable } from '../../core/base/tableOperations.js';

export const refreshMaterialTable = data => refreshDataTable({
    selector: DATATABLE_SELECTORS.MATERIAL,
    data
});
