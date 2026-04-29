import express from 'express';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';
import { getGoodsReceiptsPage } from '../../../controllers/web/warehouse/goodsReceiptController.js';

const router = express.Router();

router.get(
    '/',
    verifyCookiesAuthTokenRequired,
    authorizeUserWeb({
        roles: ['Almacenista', 'Coordinador', 'Auxiliar', 'Administrador del sistema'],
        departments: ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS']
    }),
    getGoodsReceiptsPage
);

export default router;