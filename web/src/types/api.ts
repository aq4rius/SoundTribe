/**
 * Generic API response wrappers.
 *
 * These types model the shape of responses returned by the Express backend.
 * They will be replaced by Prisma-generated types in Phase 1–3.
 */

/** Standard JSON envelope returned by most Express endpoints. */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

/** Paginated list envelope. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Standard error shape from Express error handler. */
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}
