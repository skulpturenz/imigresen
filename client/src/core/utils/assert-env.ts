import { invariant } from "es-toolkit";

export function assertEnv(
	condition: unknown,
	message: string,
): asserts condition {
	const modes: Mode[] = ["test", "storybook"];

	// disable env assertions because in these modes we
	// don't use the real services but sometimes they get bundled in
	if (modes.includes(import.meta.env.MODE as Mode)) {
		return;
	}

	invariant(condition, message);
}
