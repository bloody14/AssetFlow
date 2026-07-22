export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
