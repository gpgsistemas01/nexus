import {
    createWasteIssueDetailsDtoForEdit,
    createWasteIssueDtoForEdit,
    createWasteIssueDtoForRegister,
    createWasteIssueHeaderDtoForEdit,
    createWasteIssueDtoForReturn
} from '../../../dtos/wasteIssueDTO.js';
import {
    createWasteIssue,
    findAllWasteIssues,
    updateWasteIssue,
    updateWasteIssueDetails,
    updateWasteIssueHeader
} from '../../../services/warehouse/wasteIssues/wasteIssueService.js';
import { returnWasteIssueDetail as returnWasteIssueDetailService } from '../../../services/warehouse/wasteIssues/wasteIssueReturnService.js';
import { getDataTableOrder, getDataTablePaging, getDataTableSearch } from '../../../utils/requestQueryUtils.js';
import { sanitizeEmptyStrings } from '../../../utils/formattersUtils.js';
import { successCodeMessages } from '../../../messages/codeMessages.js';

const DATATABLE_COLUMNS = [
    'referenceNumber',
    'requestDate',
    'departmentName',
    'projectNumber',
    'clientName',
    null,
    'observations',
    null
];

export const getAllWasteIssues = async (req, res) => {

    const { skip, take } = getDataTablePaging(req.query);
    const search = getDataTableSearch(req.query);
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns: DATATABLE_COLUMNS,
        defaultDirection: 'desc'
    });

    const result = await findAllWasteIssues({
        skip,
        take,
        search,
        orderBy,
        orderDir
    });

    return res.status(200).json(result);
};

export const returnWasteIssueDetail = async (req, res) => {

    const returnDto = sanitizeEmptyStrings(createWasteIssueDtoForReturn(req.body));
    const wasteIssueReturn = await returnWasteIssueDetailService({
        id: req.params.id,
        detailId: req.params.detailId,
        returnDto,
        userId: req.user.id
    });

    return res.status(200).json({
        wasteIssueReturn,
        code: successCodeMessages.UPDATED_WASTE_ISSUE
    });
};

export const registerWasteIssue = async (req, res) => {

    const wasteIssueDto = createWasteIssueDtoForRegister(req.body);
    const sanitizedWasteIssueDto = sanitizeEmptyStrings(wasteIssueDto);

    const wasteIssue = await createWasteIssue({
        wasteIssueDto: sanitizedWasteIssueDto,
        userId: req.user.id
    });

    return res.status(201).json({
        wasteIssue,
        code: successCodeMessages.CREATED_WASTE_ISSUE
    });
};

export const editWasteIssue = async (req, res) => {

    const wasteIssueDto = createWasteIssueDtoForEdit(req.body);
    const sanitizedWasteIssueDto = sanitizeEmptyStrings(wasteIssueDto);

    const wasteIssue = await updateWasteIssue({
        id: req.params.id,
        wasteIssueDto: sanitizedWasteIssueDto
    });

    return res.status(200).json({
        wasteIssue,
        code: successCodeMessages.UPDATED_WASTE_ISSUE
    });
};

export const editWasteIssueHeader = async (req, res) => {

    const wasteIssueDto = createWasteIssueHeaderDtoForEdit(req.body);
    const sanitizedWasteIssueDto = sanitizeEmptyStrings(wasteIssueDto);

    const wasteIssue = await updateWasteIssueHeader({
        id: req.params.id,
        wasteIssueDto: sanitizedWasteIssueDto
    });

    return res.status(200).json({
        wasteIssue,
        code: successCodeMessages.UPDATED_WASTE_ISSUE
    });
};

export const editWasteIssueDetails = async (req, res) => {

    const wasteIssueDto = createWasteIssueDetailsDtoForEdit(req.body);
    const sanitizedWasteIssueDto = sanitizeEmptyStrings(wasteIssueDto);

    const wasteIssue = await updateWasteIssueDetails({
        id: req.params.id,
        wasteIssueDto: sanitizedWasteIssueDto
    });

    return res.status(200).json({
        wasteIssue,
        code: successCodeMessages.UPDATED_WASTE_ISSUE
    });
};
