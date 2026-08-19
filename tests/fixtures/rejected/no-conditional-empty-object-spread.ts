declare const enabled: boolean;
export const options = { ...(enabled ? { timeout: 1000 } : {}) };

