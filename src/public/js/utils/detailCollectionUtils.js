const findDetailIndex = ({ details, matches }) => details.findIndex(matches);

export const upsertDetail = ({ details, detail, matches, preserveKeys = [] }) => {
    const index = findDetailIndex({ details, matches });

    if (index < 0) {
        details.push(detail);
        return null;
    }

    const previousDetail = details[index];
    const preservedValues = Object.fromEntries(
        preserveKeys
            .filter(key => previousDetail[key] !== undefined)
            .map(key => [key, previousDetail[key]])
    );

    details.splice(index, 1, { ...detail, ...preservedValues });

    return previousDetail;
};

export const upsertIssueDetail = ({ details, detail, matches }) => upsertDetail({
    details,
    detail,
    matches,
    preserveKeys: ['id']
});

export const removeDetail = ({ details, matches }) => {
    const index = findDetailIndex({ details, matches });

    if (index < 0) return null;

    return details.splice(index, 1)[0];
};

export const matchesDetailIdentifier = ({ detail, identifier, inventoryIdKey }) => (
    detail.id === identifier || detail[inventoryIdKey] === identifier
);
