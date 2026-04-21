export const incrementReferenceNumberCounter = async ({ type, tx }) => {

    return tx.referenceNumberCounter.update({
        where: { prefix: type },
        data: {
            counter: {
                increment: 1
            }
        }
    });
}

export const generateReferenceNumber = async ({ type, tx }) => {

    const counter = await incrementReferenceNumberCounter({
        type,
        tx
    });

    const year = new Date().getFullYear();
    return `${type}-${year}-${counter.counter.toString().padStart(6, '0')}`;
}
