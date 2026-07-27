import { handleApiError, normalizeJqAjaxError } from "../../api/errorHandler.js";
import { initMdbWrapperInput, updateMdbWrapperInput } from "../mdb/baseInstance.js";
import { toggleDisabledElement } from "../../utils/formUtils.js";
import { bindDisabledControlWarning, setDisabledControlWarning } from "../../ui/disabledControlWarning.js";

const wrapperSelector = '#presentationDisplayInput';
const select2DisabledWarningConfig = {
    eventTargetSelector: '.select2-container',
    eventNamespace: 'select2DisabledWarning',
    resolveControl: (container) => {
        const select = container?.previousElementSibling;

        return select?.tagName === 'SELECT' ? select : null;
    }
};

bindDisabledControlWarning(select2DisabledWarningConfig);

export const initbaseSelect2 = ({ 
    baseSelector, 
    containerSelector,
    multiple = false,
    get, 
    clearOnOpen = true,
    searchDelay = 1000,
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
        multiple,
        placeholder: placeholder, 
        width: '100%',
        dropdownParent: $(containerSelector),
        minimumInputLength: 0, 
        ajax: {  
            dataType: 'json', 
            delay: searchDelay, 
            data, 
            processResults,
            transport: async (params, success, failure) => {

                try {

                    const response = await get(params.data);

                    return success(response.data);

                } catch (err) {

                    if (err.name === 'AbortError') return;

                    handleApiError({
                        err,
                        rethrow: false
                    });

                    failure(err);
                }
            }
        },
        tags,
        createTag
    });

    const baseElement = document.querySelector(baseSelector);

    toggleDisabledElement({
        element: baseElement,
        isDisabled: Boolean(baseElement?.disabled)
    });

    if (clearOnOpen) $(baseSelector).on('select2:open', () => {

        setTimeout(() => {

            $(baseSelector).val(null).trigger('change');

            setMdbWrapperInputValue({
                selector: `${ containerSelector } ${ wrapperSelector }`,
                value: ''
            });

        }, 10);
    });
}


export const mapValueLabelToSelectData = (item) => ({
    id: item.value,
    text: item.label
});

export const createNewSelectTag = ({
    term,
    label
}) => {

    const value = term.trim();

    if (!value) return null;

    return {
        id: `new:${ value }`,
        text: `${ value } (${ label })`,
        newTag: true
    };
};

export const applySelectedSelectValue = ({
    selector,
    selectedId = null,
    emptyValue = '',
    clearWhenEmpty = true
}) => {

    if (!selectedId) {

        if (clearWhenEmpty) $(selector).val(emptyValue).trigger('change');
        return;
    }

    const currentOption = $(`${ selector } option[value=\"${ selectedId }\"]`);

    if (currentOption.length) $(selector).val(selectedId).trigger('change');
};

export const initFilterSelect2 = ({
    selector,
    getOptions,
    placeholder,
    selectedId = null,
    data = (params) => ({
        search: params.term
    }),
    mapOption = mapValueLabelToSelectData,
    processResults = null,
    clearWhenEmpty = true
}) => {

    initbaseSelect2({
        baseSelector: selector,
        containerSelector: 'body',
        get: async (params) => ({
            data: await getOptions(params)
        }),
        clearOnOpen: false,
        placeholder,
        data,
        processResults: processResults || ((response) => {

            const list = response.data || response;

            return {
                results: list.map(mapOption)
            };
        })
    });

    applySelectedSelectValue({
        selector,
        selectedId,
        clearWhenEmpty
    });
};


export const initDomainSelect2 = ({
    selector,
    containerSelector,
    get,
    placeholder,
    mapOption,
    allowCreate = true,
    newTagLabel = null,
    processResults = null,
    data,
    multiple = false,
    clearOnOpen = true
}) => {

    initbaseSelect2({
        baseSelector: selector,
        containerSelector,
        multiple,
        clearOnOpen,
        get,
        placeholder,
        ...(data && { data }),
        processResults: processResults || ((response) => {

            const list = response.data || response;

            return {
                results: list.map(mapOption)
            };
        }),
        ...(allowCreate && {
            tags: true,
            createTag: (params) => createNewSelectTag({
                term: params.term,
                label: newTagLabel
            })
        })
    });
};

export const toggleSelectOption = ({ selector, data = null }) => {
    
    $(selector).val(null).trigger('change');

    const { id, text } = data || {};

    if (!text || !id) return;

    const option = new Option(text, id, false, true);

    Object.entries(data).forEach(([key, value]) => {
        option.dataset[key] = value;
    });

    $(selector).append(option).trigger('change');
};

export const toggleSelectOptions = ({ selector, data = [] }) => {

    $(selector).val(null).trigger('change');

    data.forEach(d => {

        const { id, text } = d || {};

        if (!text || !id) return;

        const option = new Option(text, id, false, true);

        $(selector).append(option);
    });

    $(selector).trigger('change');
}

export const setMdbWrapperInputValue = ({
    selector, 
    value
}) => {

    const instance = initMdbWrapperInput({
        selector,
        value
    });

    updateMdbWrapperInput(instance);
}

export const bindDependency = ({
    sourceSelector,
    onChange
}) => {

    const $source = $(sourceSelector);

    if (!$source.length) return;

    const source = $source[0];

    if (source.dataset.bound === 'true') return;

    source.dataset.bound = 'true';

    $source.on('change', () => {

        onChange?.({
            value: $source.val(),
            source: $source
        });
    });
};


export const bindDisabledSelectDependency = ({
    sourceSelector,
    targetSelector,
    clearTarget = () => {},
    onChange = () => {},
    isDisabled = (value) => !value,
    disabledMessage = null
}) => {

    const $source = $(sourceSelector);
    const targetElement = document.querySelector(targetSelector);

    if (!$source.length || !targetElement) return;

    const getDisabledState = (value) => isDisabled(value);

    setDisabledControlWarning({
        element: targetElement,
        message: disabledMessage
    });

    toggleDisabledElement({
        element: targetElement,
        isDisabled: getDisabledState($source.val())
    });

    bindDependency({
        sourceSelector,
        onChange: (payload) => {

            const disabled = getDisabledState(payload.value);

            clearTarget(payload);

            toggleDisabledElement({
                element: targetElement,
                isDisabled: disabled
            });

            onChange({
                ...payload,
                targetElement,
                isDisabled: disabled
            });
        }
    });
};
