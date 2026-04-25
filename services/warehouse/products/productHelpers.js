import { ExcededMaxRetriesSkuError } from "../../../errors/warehouse/productError.js";
import { findUniquePresentation } from "../presentationService.js";
import { findUniqueSupplierCode } from "../supplierService.js";
import { findUniqueUnitMeasure } from "../unitMeasureService.js";
import { findExistingSkus } from "./productService.js";

const MAX_RETRIES = 5;
const PRISMA_RECORD_NOT_UNIQUE = 'P2002';

const cleanNameForSku = (name = '') => {
    return name
        .replace(/\([^)]*\)/g, ' ')
        .replace(/"[^"]*"/g, ' ')
        .replace(/"/g, ' PUL ')
        .replace(/[.-]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

const getChunk = (word) => {

    const normalizedWord = word.toUpperCase().trim();

    if (/^\d+$/.test(normalizedWord)) return normalizedWord;
    if (/^\d+\/\d+$/.test(normalizedWord)) return normalizedWord;
    if (/^[A-Z]\/\d+$/.test(normalizedWord)) return normalizedWord;

    const cleaned = normalizedWord.replace(/[^A-Z0-9]/g, '');

    return cleaned.slice(0, 3);
};

const generateSku = (name) => {

    const cleanedName = cleanNameForSku(name);

    return cleanedName
        .split(' ')
        .map(word => word.trim())
        .filter(Boolean)
        .map(getChunk)
        .filter(Boolean)
        .join('-');
};

const buildUniqueSku = async ({
    baseSku,
    findExistingSkus,
    excludeProductId = null
}) => {

    const existingSkus = await findExistingSkus({
        baseSku,
        excludeProductId
    });

    const escapedBaseSku = baseSku.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedBaseSku}(?:-(\\d+))?$`);

    let max = 0;
    let baseExists = false;

    for (const item of existingSkus) {
        const match = item.sku.match(regex);

        if (match) {
            if (match[1]) {
                const num = parseInt(match[1], 10);
                if (num > max) max = num;
            } else {
                baseExists = true;
            }
        }
    }

    if (!baseExists) return baseSku;

    return `${baseSku}-${max + 1}`;
};

export const prepareProductData = async ({ tx, productDto, productId = null }) => {

    const { presentationId, unitMeasureId, supplierId, ...rest } = productDto;

    await findUniqueUnitMeasure({ tx, id: unitMeasureId });
    await findUniquePresentation({ tx, id: presentationId });

    const baseSku = generateSku(productDto.name);

    const sku = await buildUniqueSku({
        baseSku,
        excludeProductId: productId,
        findExistingSkus: findExistingSkus(tx)
    });

    const supplier = await findUniqueSupplierCode({
        tx,
        id: supplierId
    });

    return {
        rest,
        sku,
        supplier,
        relations: {
            presentationId,
            unitMeasureId,
            supplierId
        }
    };
};

export const withRetry = async (fn) => {

    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        try {
            return await fn();
        } catch (err) {

            if (err.code === PRISMA_RECORD_NOT_UNIQUE) {
                attempts++;
                continue;
            }

            throw err;
        }
    }

    throw new ExcededMaxRetriesSkuError();
};