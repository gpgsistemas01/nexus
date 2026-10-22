import { ref } from 'vue';

interface SearchQuery {
    page: number;
    search: string;
}

export const useListSearch = <Query extends SearchQuery>(
    list: {
        query: Query;
        load: () => unknown;
        applyQuery: (changes: Partial<Query>) => unknown;
    },
    readFilters: () => Partial<Query> = () => ({}),
) => {
    const search = ref(list.query.search);

    const applySearch = () => {
        const changes = { ...readFilters(), search: search.value };
        const unchanged = Object.entries(changes).every(
            ([key, value]) => list.query[key as keyof Query] === value,
        );
        if (unchanged && list.query.page === 1) void list.load();
        else list.applyQuery(changes);
    };

    return { search, applySearch };
};
