const STORAGE_KEY = 'device_fingerprint';
const FINGERPRINT_PATTERN = /^[0-9a-f]{32}$/;

function generateFingerprint(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function readStored(storage: Storage): string | null {
  try {
    const value = storage.getItem(STORAGE_KEY);
    return value !== null && FINGERPRINT_PATTERN.test(value) ? value : null;
  } catch {
    return null;
  }
}

function persist(storage: Storage, value: string) {
  try {
    storage.setItem(STORAGE_KEY, value);
  } catch {
    return;
  }
}

export function createFingerprintProvider(storage: Storage): () => string {
  let fingerprint: string | null = null;

  return () => {
    if (fingerprint !== null) return fingerprint;
    const stored = readStored(storage);
    if (stored !== null) {
      fingerprint = stored;
    } else {
      fingerprint = generateFingerprint();
      persist(storage, fingerprint);
    }
    return fingerprint;
  };
}
