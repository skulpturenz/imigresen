import { env } from "cloudflare:workers";
import {
	consola,
	type ConsolaOptions,
	type ConsolaReporter,
	type LogObject,
} from "consola";
import type { Context } from "hono";
import wretch from "wretch";
import { retry } from "wretch/middlewares";

export class ParseableReporter implements ConsolaReporter {
	#queue: LogObject[] = [];
	#interval: ReturnType<typeof setInterval>;

	constructor(
		private parseableUrl: string,
		private credentials: string, // base64 of `username:password`
		private stream: string,
		private context: Context,
		private maxEntries = 250,
		private maxRetries = 3,
		private flushInterval = 250,
	) {
		this.#interval = setInterval(() => this.flush(), this.flushInterval);
	}

	log(logObj: LogObject, _ctx: { options: ConsolaOptions }) {
		this.#queue.push(logObj);

		if (this.#queue.length >= this.maxEntries) {
			this.flush();
		}
	}

	close() {
		this.flush();
		clearInterval(this.#interval);
		consola.info.raw("closed parseable reporter");
	}

	async flush() {
		if (!this.#queue.length) {
			return;
		}

		// see: https://www.parseable.com/docs/datasource/applications/javascript#send-logs-to-the-dataset
		try {
			await wretch(this.parseableUrl)
				.headers({
					"Content-Type": "application/json",
					Authorization: `Basic ${this.credentials}`,
					"X-P-TAG-Language": "javascript",
					"X-P-TAG-Service": "imigresen-automerge-api",
					"X-P-TAG-Environment": env.WORKER_ENVIRONMENT,
					"X-P-META-CF-Version-ID": env.CF_VERSION_METADATA.id,
					"X-P-META-CF-Connecting-IP":
						this.context.req.header("CF-Connecting-IP") ?? "",
				})
				// allows `wretch` to work with cf workers
				// see: https://www.npmjs.com/package/wretch#user-content-cloudflare-workers
				.middlewares([
					next => async (url, opts) => {
						const response = await next(url, opts);
						try {
							Reflect.get(response, "type", response);
						} catch (_error) {
							Object.defineProperty(response, "type", {
								get: () => "default",
							});
						}
						return response;
					},
					retry({
						delayTimer: 500,
						delayRamp: (delay, attempts) => delay * attempts,
						maxAttempts: this.maxRetries,
						retryOnNetworkError: false,
						resolveWithLatestResponse: true,
					}),
				])
				.post(
					this.#queue.splice(0, this.#queue.length),
					`/api/v1/logstream/${this.stream}`,
				)
				.res();
		} catch (error) {
			consola.error.raw(error);
		}
	}
}
