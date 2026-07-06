// Sale has no free-text searchable fields — it's looked up by refs (customer,
// product) and date range, both handled via QueryBuilder's filter/rangeFilter.
export const SALE_DATE_RANGE_FIELD = 'createdAt';
