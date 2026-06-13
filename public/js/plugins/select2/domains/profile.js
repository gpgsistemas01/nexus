import { getAllProfiles, getProfileOptions } from "../../../application/admin/profiles.js";
import { initbaseSelect2, toggleSelectOption } from "../baseSelect.js";
import { FILTER_SELECTORS } from "../../../constants/selectors.js";

const profileFilterSelector = FILTER_SELECTORS.PROFILE;

export const getProfileSelectApi = () => ({
    getSelect: () => document.querySelector(profileFilterSelector),
    getValue: () => document.querySelector(profileFilterSelector)?.value || ''
});

export const initProfileFilterSelect = ({
    selectedId = null,
    departmentFilterSelector = null
} = {}) => {

    initbaseSelect2({
        baseSelector: profileFilterSelector,
        containerSelector: 'body',
        get: async (params) => ({
            data: await getProfileOptions(params)
        }),
        clearOnOpen: false,
        placeholder: 'Filtrar por perfil',
        data: (params) => {

            const departmentName = departmentFilterSelector
                ? $(`${ departmentFilterSelector } option:selected`).text()
                : '';

            return {
                search: params.term,
                ...(departmentName && {
                    department: departmentName,
                    strictDepartmentFilter: true
                })
            };
        },
        processResults: (data) => {
            const list = data.data || data;
            return {
                results: list.map(profile => ({
                    id: profile.value,
                    text: profile.label
                }))
            };
        }
    });

    if (!selectedId) {

        $(profileFilterSelector).val('').trigger('change');
        return;
    }

    const currentOption = $(`${ profileFilterSelector } option[value=\"${ selectedId }\"]`);

    if (currentOption.length) $(profileFilterSelector).val(selectedId).trigger('change');
};

export const initProfileSelect = ({ 
    modalSelector, 
    baseSelector, 
    placeholder, 
    clearOnOpen = true,
    data, 
    allowCreate = true 
}) => {

    initbaseSelect2({
        baseSelector,
        containerSelector: modalSelector,
        get: getAllProfiles,
        clearOnOpen,
        data,
        placeholder,
        processResults: (data) => {

            const list = data.data || data;

            return {
                results: list.map(p => ({
                    id: p.id,
                    text: p.fullName
                }))
            };
        },
        ...(allowCreate && {
            tags: true,
            createTag: (params) => {

                const term = params.term.trim();

                if (!term) return null;

                return {
                    id: `new:${ term }`,
                    text: `${ term } (Nuevo perfil)`,
                    newTag: true
                };
            }
        })
    });
};

export const toggleProfileOption = ({ 
    selector, 
    id = null, 
    name = null
}) => toggleSelectOption({
    selector,
    data: {
        id,
        text: name
    }
});
