import { FILTER_SELECTORS } from "../../../../../constants/selectors.js";

export const getDateFilterApi = () => ({
    getValues: () => ({
        startDate: document.querySelector(FILTER_SELECTORS.START_DATE)?.value || '',
        endDate: document.querySelector(FILTER_SELECTORS.END_DATE)?.value || ''
    })
});

export const attachDateFilterHandler = ({
    onChange
}) => {

    $(FILTER_SELECTORS.START_DATE).on('change', () => {
        onChange?.();
    });

    $(FILTER_SELECTORS.END_DATE).on('change', () => {
        onChange?.();
    });
};

export const buildDateFilterConfig = ({
    onChange
}) => ({
    customGetValues: () => ({
        startDate: document.querySelector(FILTER_SELECTORS.START_DATE)?.value || '',
        endDate: document.querySelector(FILTER_SELECTORS.END_DATE)?.value || ''
    }),
    attachHandler: () => attachDateFilterHandler({
        onChange
    })
});
