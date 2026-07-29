import { openClientModal } from "../../../modules/clients/clientModal.js";
import { getAllClients, getClientOptions } from "../../../application/sales/clients.js";
import { initDomainSelect2, initFilterSelect2, runAfterSelect2Close, toggleSelectOption } from "../baseSelect.js";
import { FILTER_SELECTORS } from "../../../constants/selectors.js";

const clientFilterSelector = FILTER_SELECTORS.CLIENT;

export const initClientFilterSelect = ({
    selectedId = null
} = {}) => initFilterSelect2({
    selector: clientFilterSelector,
    getOptions: getClientOptions,
    placeholder: 'Filtrar por cliente',
    selectedId
});

export const initClientSelect = ({ 
    modalSelector, 
    advisorSelector = null,
    baseSelector, 
    allowCreate = true
}) => initDomainSelect2({
    selector: baseSelector,
    containerSelector: modalSelector,
    get: getAllClients,
    placeholder: 'Buscar cliente...',
    mapOption: (client) => ({
        id: client.id,
        text: client.name,
    }),
    allowCreate,
    newTagLabel: 'Nuevo cliente'
});

const attachClientHandler = ({
    baseSelector
}) => {

    $(baseSelector).off('select2:select').on('select2:select', (e) => {

        const data = e.params.data;

        if (data.newTag) {

            const name = data.id.replace('new:', '');
            
            runAfterSelect2Close({
                selector: baseSelector,
                action: () => openClientModal({
                    data: { name },
                    onSave: (createdClient) => {

                        toggleClientOption({
                            selector: baseSelector,
                            id: createdClient.id,
                            name: createdClient.name
                        });
                    }
                })
            });

            return;
        }
    });
};

export const toggleClientOption = ({ 
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

export const setupClientSelect = ({ 
    modalSelector, 
    clientSelector,
    allowCreate = true,
}) => {

    initClientSelect({
        modalSelector,
        baseSelector: `${ modalSelector } ${ clientSelector }`,
        allowCreate
    });

    attachClientHandler({
        baseSelector: `${ modalSelector } ${ clientSelector }`,
    });
};
