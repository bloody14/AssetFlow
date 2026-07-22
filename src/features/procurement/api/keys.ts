export const procurementKeys = {
  all: ['procurement'] as const,
  lists: () => [...procurementKeys.all, 'list'] as const,
  list: (filters: string) => [...procurementKeys.lists(), { filters }] as const,
  details: () => [...procurementKeys.all, 'detail'] as const,
  detail: (id: string) => [...procurementKeys.details(), id] as const,
};
