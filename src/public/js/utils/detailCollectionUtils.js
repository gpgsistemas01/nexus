const findDetailIndex = ({ details, matches }) => details.findIndex(matches);

export const upsertDetail = ({ details, detail, matches }) => {
    const index = findDetailIndex({ details, matches });

    if (index < 0) {
        details.push(detail);
        return null;
    }

    const previousDetail = details[index];
    details.splice(index, 1, detail);

    return previousDetail;
};

export const removeDetail = ({ details, matches }) => {
    const index = findDetailIndex({ details, matches });

    if (index < 0) return null;

    return details.splice(index, 1)[0];
};

export const matchesDetailIdentifier = ({ detail, identifier, inventoryIdKey }) => (
    detail.id === identifier || detail[inventoryIdKey] === identifier
);
