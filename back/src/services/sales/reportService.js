import { findBatches } from '../../repository/paginationRepository.js';
import { findAllClients } from './clientService.js';

export const findClientReportRows = async function* (params = {}) {
    for await (const page of findBatches({
        query: params,
        fetchPage: async query => (await findAllClients({ ...query, includeCounts: false })).data
    })) yield* page;
};
