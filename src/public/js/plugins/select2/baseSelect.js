import { DOM_EVENT_NAMES, SELECT2_EVENT_NAMES } from '../../constants/events.js';
import { INPUT_SELECTORS } from '../../constants/selectors.js';
import { handleApiError } from "../../api/errorHandler.js";
import { initMdbWrapperInput, updateMdbWrapperInput } from "../mdb/baseInstance.js";
import { toggleDisabledElement } from "../../utils/formUtils.js";
import { bindDisabledControlWarning, setDisabledControlWarning } from "../../ui/disabledControlWarning.js";

const wrapperSelector = INPUT_SELECTORS.PRESENTATION_DISPLAY;
export const SELECT_RESULTS_LIMIT = 20;

export const buildPaginatedSelectParams = (params = {}, {
    length = SELECT_RESULTS_LIMIT,
    additionalParams = {}
} = {}) => {
    const page = Number(params.page) || 1;

    return {
        search: params.term,
        start: (page - 1) * length,
        length,
        ...additionalParams
    };
};

export const buildPaginatedSelectResults = (response, params = {}, {
    length = SELECT_RESULTS_LIMIT,
    mapItem = (item) => item
} = {}) => {
    const page = Number(params.page) || 1;
    let list = JSON.parse(JSON.stringify(response.data || response));
    const recordsFiltered = Number(response.recordsFiltered) || list.length;

    return {
        results: list.map(mapItem),
        pagination: {
            more: page * length < recordsFiltered
        }
    };
};

const select2DisabledWarningConfig = {
    eventTargetSelector: '.select2-container',
    eventNamespace: 'select2DisabledWarning',
    resolveControl: (container) => {
        const select = container?.previousElementSibling;

        return select?.tagName === 'SELECT' ? select : null;
    }
};

bindDisabledControlWarning(select2DisabledWarningConfig);

export const runAfterSelect2Close = ({ selector, action }) => {

    const $select = $(selector);
    const deferAction = () => setTimeout(action, 0);

    if (!$select.hasClass('select2-hidden-accessible')) {
        deferAction();
        return;
    }

    const select2 = $select.data('select2');

    if (!select2?.isOpen()) {
        deferAction();
        return;
    }

    // Wait for Select2's real close event before scheduling the modal. Calling
    // close and merely starting a timer here races Select2's own close handlers.
    $select.one(SELECT2_EVENT_NAMES.CLOSE, deferAction);
    $select.select2('close');
};

export const clearSelectValue = selector => $(selector).val(null).trigger(DOM_EVENT_NAMES.CHANGE);

export const initbaseSelect2 = ({ 
    baseSelector, 
    containerSelector,
    multiple = false,
    get, 
    clearOnOpen = true,
    searchDelay = 1000,
    placeholder,
    processResults,
    data = () => null,
    tags = false,
    createTag = (params) => {

        return {
            id: params.term,
            text: params.term
        };
    }
}) => {

    if ($(baseSelector).hasClass("select2-hidden-accessible")) $(baseSelector).select2('destroy');

    const resolveRequestData = (params) => ({
        ...buildPaginatedSelectParams(params),
        ...data(params)
    });

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
            data: resolveRequestData,
            processResults,
            transport: async (params, success, failure) => {

                try {

                    const response = await get(params.data);

                    return success(Array.isArray(response) ? response : response?.data);

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

    if (clearOnOpen) $(baseSelector).on(SELECT2_EVENT_NAMES.OPEN, () => {

        setTimeout(() => {

            $(baseSelector).val(null).trigger(DOM_EVENT_NAMES.CHANGE);

            setMdbWrapperInputValue({
                selector: `${ containerSelector } ${ wrapperSelector }`,
                value: ''
            });

        }, 10);
    });
}

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

        if (clearWhenEmpty) $(selector).val(emptyValue).trigger(DOM_EVENT_NAMES.CHANGE);
        return;
    }

    const currentOption = $(`${ selector } option[value=\"${ selectedId }\"]`);

    if (currentOption.length) $(selector).val(selectedId).trigger(DOM_EVENT_NAMES.CHANGE);
};

export const initFilterSelect2 = ({
    selector,
    getOptions,
    placeholder,
    selectedId = null,
    data = () => null,
    mapOption = (item) => ({
        id: item.value,
        text: item.label
    }),
    clearWhenEmpty = true
}) => {

    initbaseSelect2({
        baseSelector: selector,
        containerSelector: 'body',
        get: getOptions,
        clearOnOpen: false,
        placeholder,
        data,
        processResults: (response, params) => buildPaginatedSelectResults(response, params, { mapItem: mapOption })
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
    clearOnOpen = true,
    resultsLimit = SELECT_RESULTS_LIMIT
}) => {

    initbaseSelect2({
        baseSelector: selector,
        containerSelector,
        multiple,
        clearOnOpen,
        get,
        placeholder,
        ...(data && { data }),
        processResults: processResults || ((response, params) => buildPaginatedSelectResults(response, params, {
            length: resultsLimit,
            mapItem: mapOption
        })),
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
    
    $(selector).val(null).trigger(DOM_EVENT_NAMES.CHANGE);

    const { id, text } = data || {};

    if (!text || !id) return;

    const option = new Option(text, id, false, true);

    Object.entries(data).forEach(([key, value]) => {
        option.dataset[key] = value;
    });

    $(selector).append(option).trigger(DOM_EVENT_NAMES.CHANGE);
};

export const toggleSelectOptions = ({ selector, data = [] }) => {

    $(selector).val(null).trigger(DOM_EVENT_NAMES.CHANGE);

    data.forEach(d => {

        const { id, text } = d || {};

        if (!text || !id) return;

        const option = new Option(text, id, false, true);

        $(selector).append(option);
    });

    $(selector).trigger(DOM_EVENT_NAMES.CHANGE);
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

export const updatePresentationDisplay = ({ modalSelector, data, presentation, option }) => {
    if (!option) return;

    Object.entries(data).forEach(([key, value]) => {
        option.dataset[key] = value;
    });

    setMdbWrapperInputValue({
        selector: `${ modalSelector } ${ wrapperSelector }`,
        value: presentation.name || ''
    });
};

export const bindDependency = ({
    sourceSelector,
    onChange
}) => {

    const $source = $(sourceSelector);

    if (!$source.length) return;

    const source = $source[0];

    if (source.dataset.bound === 'true') return;

    source.dataset.bound = 'true';

    $source.on(DOM_EVENT_NAMES.CHANGE, () => {

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
