import { deleteMaterialRequest, editMaterialRequest, editMaterialStockRequest, getAllMaterialsRequest, registerMaterialRequest } from "../../services/warehouse/materialService.js";
import { createCrudApplication } from "../createCrudApplication.js";

const GOODS_RECEIPT_CREATION_CONTEXT = 'goodsReceipt';

const omitMaxUnitCost = ({ maxUnitCost: _maxUnitCost, ...formData }) => formData;

const materialApplication = createCrudApplication({
    requests: {
        getAll: getAllMaterialsRequest,
        register: ({ data, creationContext = null }) => registerMaterialRequest({
            data: creationContext === GOODS_RECEIPT_CREATION_CONTEXT
                ? omitMaxUnitCost(data)
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
