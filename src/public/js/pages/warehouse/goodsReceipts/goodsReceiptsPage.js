import { createGoodsReceiptDatatable } from '../../../plugins/datatable/warehouse/goodsReceipts/goodsReceiptDatatable.js';
import '../materials/materialForm.js';
import '../suppliers/supplierForm.js';
import './goodsReceiptForm.js';
import { openGoodsReceiptModal } from './goodsReceiptModal.js';

createGoodsReceiptDatatable({ openGoodsReceiptModal });
