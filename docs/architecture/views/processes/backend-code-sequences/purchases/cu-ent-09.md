<a id="cu-ent-09"></a>
# `CU-ENT-09` — Editar compra de consumible

> Esta secuencia usa la ruta y la fachada específicas de consumibles; los componentes con nombres históricos de material pertenecen al núcleo compartido de inventario.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/goodsReceiptApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/goodsReceiptValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsReceiptController.js
    participant ReceiptDto@{ "type": "entity" } as goodsReceiptDto: Object<br/>src/dtos/goodsReceiptDTO.js
    participant Domain@{ "type": "control" } as src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/goods-receipts/consumables/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: goodsReceiptHeaderValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else goodsReceiptHeaderValidation rechaza req.body/req.params
        Validator-->>Client: HTTP 400 { errors }
    else PERMISSIONS.GOODS_RECEIPTS_MANAGE denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Route->>Controller: editConsumableGoodsReceipt(req, res)
        activate Controller
        Controller->>ReceiptDto: createGoodsReceiptDtoForEdit(req.body)
        ReceiptDto-->>Controller: createGoodsReceiptDtoForEdit(): Object (goodsReceiptDto)
        Controller->>Domain: consumableGoodsReceiptService.updateConsumableGoodsReceipt({ id: req.params.id, goodsReceiptDto }) conserva detalles persistidos y actualiza encabezado permitido
        activate Domain
        alt Servicio resuelto
            Domain-->>Controller: consumableGoodsReceiptService.updateConsumableGoodsReceipt(): Promise[GoodsReceipt]
            Controller-->>Client: HTTP 2xx { code, data }
        else AppError propagado
            Domain-->>Controller: throw AppError { code, message, meta, statusCode }
            Controller->>ErrorHandler: next(error)
            ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
        end
        deactivate Domain
        deactivate Controller
    end
```

