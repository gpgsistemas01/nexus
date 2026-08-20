const readFilterValues = (getters = {}) => Object.assign(
    {},
    ...Object.values(getters).map(getter => getter())
);

export const createTableFilterState = (getters = {}) => {
    let appliedValues = {};

    return {
        apply: () => {
            appliedValues = readFilterValues(getters);

            return { ...appliedValues };
        },
        getValues: () => ({ ...appliedValues })
    };
};
