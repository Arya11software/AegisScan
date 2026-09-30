import { parentPort, workerData } from 'worker_threads';
import { scannerService } from '../services/scannerService.js';

try {
  const { executableCheckIds } = workerData || {};
  if (!executableCheckIds || !Array.isArray(executableCheckIds)) {
    throw new Error('Invalid or missing executableCheckIds passed to scanner worker.');
  }

  const scanResult = scannerService.runChecks(executableCheckIds);
  parentPort.postMessage({ success: true, scanResult });
} catch (err) {
  parentPort.postMessage({
    success: false,
    error: {
      code: 'SCANNER_WORKER_ERROR',
      message: err.message || 'Worker thread scan execution failed.'
    }
  });
}
