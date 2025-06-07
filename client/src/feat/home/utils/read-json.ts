import { invariant } from "es-toolkit";

export const readJson = <T extends Record<string, any> = Record<string, any>>(
	file: File,
): Promise<T | null> => {
	const reader = new FileReader();

	const promise = new Promise<T | null>((resolve, reject) => {
		reader.addEventListener("load", () => {
			const result = reader.result?.toString();

			if (!result) {
				resolve(null);
			}

			invariant(result, "Failed to read file");

			try {
				return resolve(JSON.parse(result));
			} catch (error: unknown) {
				return reject(new Error("Failed to read file"));
			}
		});

		reader.addEventListener("error", () => {
			return reject(new Error("Failed to read file"));
		});
	});

	reader.readAsText(file);

	return promise;
};
