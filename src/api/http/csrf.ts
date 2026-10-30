export interface CsrfStore {
  get(): Promise<string>;
  invalidate(staleToken: string): void;
}

export function createCsrfStore(fetchToken: () => Promise<string>): CsrfStore {
  let token: string | null = null;
  let pending: Promise<string> | null = null;

  return {
    get() {
      if (token !== null) return Promise.resolve(token);
      pending ??= fetchToken()
        .then((value) => {
          token = value;
          return value;
        })
        .finally(() => {
          pending = null;
        });
      return pending;
    },
    invalidate(staleToken) {
      if (token === staleToken) token = null;
    },
  };
}
