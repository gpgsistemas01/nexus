import { deleteMaterialRequest, editMaterialRequest, editMaterialStockRequest, getAllMaterialsRequest, registerMaterialRequest } from "../../../services/warehouse/materialService.js";
import { createCrudApplication } from "../../createCrudApplication.js";

const GOODS_RECEIPT_CREATION_CONTEXT = 'goodsReceipt';

const buildGoodsReceiptMaterialData = ({ maxUnitCost: _maxUnitCost, newStock: _newStock, ...formData }) => ({
    ...formData,
    creationContext: GOODS_RECEIPT_CREATION_CONTEXT
});

const materialApplication = createCrudApplication({
    requests: {
        getAll: getAllMaterialsRequest,
        register: ({ data, creationContext = null }) => registerMaterialRequest({
            data: creationContext === GOODS_RECEIPT_CREATION_CONTEXT
                ? buildGoodsReceiptMaterialData(data)
                : data
        }),
        edit: editMaterialRequest,
        editStock: editMaterialStockRequest,
        remove: deleteMaterialRequest
    },
    dataKeys: { register: 'material' },
    additionalMutations: ['editStock', 'remove']
});

export const getAllMaterials = materialApplication.getAll;
export const registerMaterial = materialApplication.register;
export const editMaterial = materialApplication.edit;

export const editMaterialStock = materialApplication.editStock;
export const deleteMaterial = materialApplication.remove;
