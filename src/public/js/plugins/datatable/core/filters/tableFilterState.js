export const createTableFilterState = (getters = {}) => {
    let appliedValues = {};

    return {
        apply: () => {
            appliedValues = Object.assign(
                {},
                ...Object.values(getters).map(getter => getter())
            );

            return { ...appliedValues };
        },
        getValues: () => ({ ...appliedValues })
    };
};
