import { Router } from 'express';
import { join } from 'node:path';
import { rootDir } from '../../utils/pathsUtils.js';

const contractPath = join(rootDir, 'docs/architecture/openapi/openapi.json');

const createDocumentationRouter = async () => {
    // Las herramientas y fuentes documentales sólo se cargan al abrir el visor en desarrollo.
    const [{ default: swaggerUi }, { bundleOpenApiContract }] = await Promise.all([
        import('swagger-ui-express'),
        import('../../../scripts/openApiContractUtils.js')
    ]);
    const router = Router();

    router.get('/openapi.json', async (req, res) => {
        res.set('Cache-Control', 'no-store');
        res.json(await bundleOpenApiContract(contractPath));
    });
    router.use(swaggerUi.serve);
    router.get('/', swaggerUi.setup(null, {
        customSiteTitle: 'Nexus API',
        swaggerOptions: {
            url: './openapi.json',
            validatorUrl: null,
            withCredentials: true,
            persistAuthorization: false,
            displayOperationId: true,
            defaultModelsExpandDepth: 0
        }
    }));

    return router;
};

const router = Router();
let documentationRouter;

router.use(async (req, res, next) => {
    if (process.env.NODE_ENV === 'production') return next();

    documentationRouter ??= createDocumentationRouter();
    const handler = await documentationRouter;
    return handler(req, res, next);
});

export default router;
