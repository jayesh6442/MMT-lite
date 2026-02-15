// Common types used across the application

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchFilters {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
}

export type BookingType = "HOTEL" | "FLIGHT" | "TRAIN";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
}
