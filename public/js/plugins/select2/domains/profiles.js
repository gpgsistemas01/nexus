import { PROFILES_API_ROUTE } from "../../../services/admin/profileService.js";
import { initbaseSelect2 } from "../baseSelect.js";

export const initProfileSelect = ({ 
    modalSelector, 
    baseSelector, 
    placeholder, 
    data, 
    allowCreate = true 
}) => {

    initbaseSelect2({
        baseSelector,
        modalSelector,
        url: PROFILES_API_ROUTE,
        data,
        placeholder,
        processResults: (data) => {

            const list = data.data || data;

            return {
                results: list.map(p => ({
                    id: p.id,
                    text: `${ p.name } ${ p.lastName }`
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
                    text: `${ term } (Nuevo producto)`,
                    newTag: true
                };
            }
        })
    });
};

export const toggleProfileOption = ({ 
    selector, 
    profileId = null, 
    profileName = null
}) => toggleSelectOption({
    selector,
    id: profileId,
    name: profileName,
});