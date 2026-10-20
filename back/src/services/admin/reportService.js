import { findBatches } from '../../repository/paginationRepository.js';
import { findAllPersons } from './person/personService.js';
import { findAllUsers } from './userService.js';

export const findUserReportRows = async function* (params = {}) {
    for await (const page of findBatches({
        query: params,
        fetchPage: async query => (await findAllUsers({ ...query, includeCounts: false })).data
    })) yield* page;
};

export const findPersonReportRows = async function* (params = {}) {
    for await (const page of findBatches({
        query: params,
        fetchPage: async query => (await findAllPersons({
            ...query,
            includeAccesses: true,
            includeCounts: false
        })).data
    })) yield* page;
};
