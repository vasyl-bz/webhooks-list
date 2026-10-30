import { setupWorker } from 'msw/browser';
import { createMockDb } from './db';
import { createHandlers } from './handlers';

export const FAIL_LIST_FLAG = 'mock:fail-webhooks';

function isFailureFlagOn(): boolean {
  try {
    return window.localStorage.getItem(FAIL_LIST_FLAG) === '1';
  } catch {
    return false;
  }
}

export const worker = setupWorker(
  ...createHandlers(createMockDb(), {
    latencyMs: 350,
    shouldFail: isFailureFlagOn,
  }),
);
