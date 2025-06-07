import { invariant } from "es-toolkit";

export function assertEnv(
	condition: unknown,
	message: string,
): asserts condition {
	if (["test", "storybook"].includes(import.meta.env.MODE)) {
		return;
	}

	invariant(condition, message);
}
