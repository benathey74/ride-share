export const adminKeys = {
  all: ["admin"] as const,
  dashboard: () => [...adminKeys.all, "dashboard"] as const,
  users: () => [...adminKeys.all, "users"] as const,
  reports: () => [...adminKeys.all, "reports"] as const,
};
