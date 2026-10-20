import { openCatalogModal } from './catalogModal.js';
import { createCatalogDatatable } from '../../../plugins/datatable/admin/catalogs/catalogDatatable.js';
import './catalogForm.js';

createCatalogDatatable({ onOpen: openCatalogModal });
