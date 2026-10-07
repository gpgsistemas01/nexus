import {
    createGoodsIssueDetailsDtoForEdit,
    createGoodsIssueDtoForEdit,
    createGoodsIssueDtoForRegister,
    createGoodsIssueDtoForReturn,
    createGoodsIssueHeaderDtoForEdit
} from "../../../../../dtos/goodsIssueDTO.js";
import { successCodeMessages } from "../../../../../messages/codeMessages.js";
import { sanitizeEmptyStrings } from "../../../../../utils/formattersUtils.js";
import { emitInventoryUpdated } from "../../../../../utils/socketUtils.js";
import { getIssueDataTableQuery } from '../../../../../utils/issueQueryUtils.js';

const DATATABLE_COLUMNS = ['referenceNumber', 'requestDate', 'departmentName', 'projectNumber', 'clientName', null, null];

export const buildListHandler = findAllGoodsIssues => async (req, res) => {

    const query = getIssueDataTableQuery({
        query: req.query,
        columns: DATATABLE_COLUMNS
    });

    const result = await findAllGoodsIssues({
        ...query,
        accesses: req.user?.accesses
    });

    return res.status(200).json(result);
};

export const buildRegisterHandler = createGoodsIssue => async (req, res) => {

    const goodsIssueDto = createGoodsIssueDtoForRegister(req.body);
    const sanitizedGoodsIssueDto = sanitizeEmptyStrings(goodsIssueDto);

    const goodsIssue = await createGoodsIssue({
        goodsIssueDto: sanitizedGoodsIssueDto
    });

    return res.status(200).json({
        goodsIssue,
        code: successCodeMessages.CREATED_GOODS_ISSUE
    });
};

export const buildEditHandler = updateGoodsIssue => async (req, res) => {

    const goodsIssueDto = createGoodsIssueDtoForEdit(req.body);
    const sanitizedGoodsIssueDto = sanitizeEmptyStrings(goodsIssueDto);

    const goodsIssue = await updateGoodsIssue({
        goodsIssueDto: sanitizedGoodsIssueDto,
        id: req.params.id
    });

    return res.status(200).json({
        goodsIssue,
        code: successCodeMessages.UPDATED_GOODS_ISSUE
    });
};

export const buildHeaderHandler = updateGoodsIssueHeader => async (req, res) => {

    const goodsIssueDto = createGoodsIssueHeaderDtoForEdit(req.body);
    const sanitizedGoodsIssueDto = sanitizeEmptyStrings(goodsIssueDto);

    const goodsIssue = await updateGoodsIssueHeader({
        goodsIssueDto: sanitizedGoodsIssueDto,
        id: req.params.id
    });

    return res.status(200).json({
        goodsIssue,
        code: successCodeMessages.UPDATED_GOODS_ISSUE
    });
};

export const buildDetailsHandler = ({ updateGoodsIssueDetails, inventoryContext }) => async (req, res) => {

    const goodsIssueDto = createGoodsIssueDetailsDtoForEdit(req.body);
    const sanitizedGoodsIssueDto = sanitizeEmptyStrings(goodsIssueDto);

    const goodsIssue = await updateGoodsIssueDetails({
        goodsIssueDto: sanitizedGoodsIssueDto,
        id: req.params.id
    });

    emitInventoryUpdated({ context: inventoryContext, source: 'goods-issue-supplied' });

    return res.status(200).json({
        goodsIssue,
        code: successCodeMessages.UPDATED_GOODS_ISSUE
    });
};

export const buildReturnHandler = ({ returnGoodsIssueDetail, inventoryContext }) => async (req, res) => {

    const returnDto = createGoodsIssueDtoForReturn(req.body);
    const sanitizedReturnDto = sanitizeEmptyStrings(returnDto);

    const goodsIssueReturn = await returnGoodsIssueDetail({
        id: req.params.id,
        detailId: req.params.detailId,
        returnDto: sanitizedReturnDto,
        userId: req.user.id
    });

    emitInventoryUpdated({ context: inventoryContext, source: 'goods-issue-return-created' });

    return res.status(200).json({
        goodsIssueReturn,
        code: successCodeMessages.UPDATED_GOODS_ISSUE
    });
};
