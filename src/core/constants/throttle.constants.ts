export const THROTTLE_LIMITS = {
  GLOBAL: {
    ttl: 60_000,
    limit: 100,
  },

  AUTH: {
    ttl: 60_000,
    limit: 5,
  },

  REPORTS: {
    ttl: 60_000,
    limit: 30,
  },
} as const;
