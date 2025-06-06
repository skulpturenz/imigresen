import { delay } from "es-toolkit";

export const makeTimeout =
	({ timeoutMs = 500, message = "" }) =>
	(promise: Promise<any>) =>
		Promise.race([
			promise,
			new Promise((_, reject) =>
				delay(timeoutMs).then(() =>
					reject(
						new Error(message || `timed out after ${timeoutMs} ms`),
					),
				),
			),
		]);
