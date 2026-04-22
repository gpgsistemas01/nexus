export const initbaseSelect2 = ({ 
    baseSelector, 
    modalSelector,
    url, 
    placeholder,
    processResults,
    data = (params) => {
        return {
            search: params.term
        };
    },
    tags = false,
    createTag = (params) => {

        return {
            id: params.term,
            text: params.term
        };
    }
}) => {

    if ($(baseSelector).hasClass("select2-hidden-accessible")) $(baseSelector).select2('destroy');

    $(baseSelector).select2({ 
        language: 'es',
        placeholder: placeholder, 
        dropdownParent: $(modalSelector),
        minimumInputLength: 0, 
        ajax: { 
            url: url, 
            dataType: 'json', 
            delay: 250, 
            data, 
            processResults: processResults 
        },
        tags,
        createTag
    });
}

export const toggleSelectOption = ({ selector, id = null, name = null }) => {
    
    $(selector).empty().trigger('change');

    if (!id || !name) return;

    const option = new Option(
        name,
        id,
        true,
        true
    );

    $(selector).append(option).trigger('change');
};