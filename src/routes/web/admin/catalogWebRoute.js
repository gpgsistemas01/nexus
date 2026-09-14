import express from 'express';
import { getCatalogsPage } from '../../../controllers/web/admin/catalogController.js';
import { PERMISSIONS } from '../../../constants/permissions.js';
import { authorizeUserWeb, verifyCookiesAuthTokenRequired } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyCookiesAuthTokenRequired, authorizeUserWeb(PERMISSIONS.CATALOGS_MANAGE));
router.get('/', (req, res) => res.redirect('/catalogos/departments'));
router.get('/:catalog', getCatalogsPage);

export default router;
