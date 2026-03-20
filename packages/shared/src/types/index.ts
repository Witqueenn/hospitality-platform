export * from "./agent";

// ─────────────────────────────────────────────
// Common Utility Types
// ─────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface DomainEvent<T = unknown> {
  id: string;
  type: string;
  tenantId: string;
  payload: T;
  occurredAt: Date;
}
