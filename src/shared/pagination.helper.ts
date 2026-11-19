export interface PaginationQuery {
  page?: number | string;
  limit?: number | string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function normalizePagination(
  query?: PaginationQuery,
  defaultLimit = 10,
  maxLimit = 100,
): { enabled: boolean; page: number; limit: number; skip: number } {
  const rawPage = query?.page !== undefined ? Number(query.page) : undefined;
  const rawLimit = query?.limit !== undefined ? Number(query.limit) : undefined;

  const hasValidPage = rawPage !== undefined && Number.isFinite(rawPage) && rawPage >= 1;
  const hasValidLimit = rawLimit !== undefined && Number.isFinite(rawLimit) && rawLimit >= 1;

  if (!hasValidPage && !hasValidLimit) {
    return { enabled: false, page: 1, limit: defaultLimit, skip: 0 };
  }

  const page = hasValidPage ? Math.floor(rawPage) : 1;
  const limit = hasValidLimit ? Math.min(maxLimit, Math.floor(rawLimit)) : defaultLimit;
  const skip = (page - 1) * limit;

  return { enabled: true, page, limit, skip };
}