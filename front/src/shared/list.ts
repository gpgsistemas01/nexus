export interface RecordQuery {
    page: number;
    length: number;
    search: string;
    orderColumn: number;
    direction: 'asc' | 'desc';
}

export const initialRecordQuery = (): RecordQuery => ({
    page: 1,
    length: 10,
    search: '',
    orderColumn: 0,
    direction: 'asc',
});
