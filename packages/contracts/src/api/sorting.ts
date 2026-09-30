export const SortDirection = {
  ASC: "asc",
  DESC: "desc",
} as const;

export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];

export interface SortQuery {
  sortBy?: string;
  sortDirection?: SortDirection;
}
