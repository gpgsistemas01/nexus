const incrementYearlyReferenceNumberCounter = async ({ type, tx, year }) => {

    return tx.referenceNumberCounter.upsert({
        where: {
            prefix_year: {
                prefix: type,
                year
            }
        },
        update: {
            counter: {
                increment: 1
            }
        },
        create: {
            prefix: type,
            year,
            counter: 1
        }
    });
}

export const incrementNonYearlyReferenceNumberCounter = async ({ type, tx }) => {

    return tx.referenceNumberCounter.update({
        where: {
            prefix_year: {
                prefix: type,
                year: 0
            }
        },
        data: {
            counter: {
                increment: 1
            }
        }
    });
}

export const generateYearlyReferenceNumber = async ({ type, tx }) => {

    const year = new Date().getFullYear();
    const counter = await incrementYearlyReferenceNumberCounter({
        type,
        tx,
        year
    });

    return `${type}-${year}-${counter.counter.toString().padStart(6, '0')}`;
}
