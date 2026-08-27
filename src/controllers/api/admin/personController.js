import { createPersonDtoForEdit, createPersonDtoForRegister } from "../../../dtos/personDTO.js";
import { successCodeMessages } from "../../../messages/codeMessages.js";
import { createPerson, findAllPersons, updatePerson } from "../../../services/admin/person/personService.js";
import { sanitizeEmptyStrings } from "../../../utils/formattersUtils.js";
import { getDataTableOrder, getDataTablePaging, getDataTableSearch } from "../../../utils/requestQueryUtils.js";

const allowedDepartments = ['ALMACÉN Y PROVEDURÍA', 'SISTEMAS'];

export const getAllPersons = async (req, res) => {

    const rawDepartment =
        req.query.department ??
        req.query['department[]'];
    const rawRole =
        req.query.role ??
        req.query['role[]'];
    const strictDepartmentFilter = req.query.strictDepartmentFilter === 'true';
    const includeAccesses = req.query.includeAccesses === 'true';
    const { user } = req;
    const { skip, take } = getDataTablePaging(req.query);
    const search = getDataTableSearch(req.query);

    const columns = ['fullName', null, null];
    const { orderBy, orderDir } = getDataTableOrder({
        query: req.query,
        columns
    });

    const userDepartments = (user?.accesses || [])
        .map(access => access.department)
        .filter(Boolean);
    const canViewAllPersons = userDepartments.some(departmentName =>
        allowedDepartments.includes(departmentName)
    );

    const departmentFilters = Array.isArray(rawDepartment)
        ? rawDepartment
        : rawDepartment
            ? [rawDepartment]
            : [];

    const roleFilters = Array.isArray(rawRole)
        ? rawRole
        : rawRole
            ? [rawRole]
            : [];

    const shouldUseExplicitDepartmentFilters = strictDepartmentFilter || departmentFilters.length > 0;

    const departments = shouldUseExplicitDepartmentFilters
        ? departmentFilters
        : (canViewAllPersons ? [] : userDepartments);

    const result = await findAllPersons({
        departments,
        roles: roleFilters,
        skip,
        take,
        search,
        orderBy,
        orderDir,
        includeAccesses
    });

    res.status(200).json(result);
}

export const registerPerson = async (req, res) => {

    const personDto = createPersonDtoForRegister(req.body);
    const sanitizedPersonDto = sanitizeEmptyStrings(personDto);

    const person = await createPerson({ personDto: sanitizedPersonDto });

    return res.status(201).json({ person, code: successCodeMessages.CREATED_PERSON });
}

export const editPerson = async (req, res) => {

    const { id } = req.params;
    const personDto = createPersonDtoForEdit(req.body);
    const sanitizedPersonDto = sanitizeEmptyStrings(personDto);

    const person = await updatePerson({ id, personDto: sanitizedPersonDto });

    return res.status(200).json({ person, code: successCodeMessages.UPDATED_PERSON });
}
