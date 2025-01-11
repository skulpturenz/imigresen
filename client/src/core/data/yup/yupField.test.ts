import { createRoot, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { string } from "yup";
import { yupField } from "./yupField";

describe("yupField", () => {
	it("validates the field against the schema", async () => {
		const schema = string().required();
		const validate = yupField(schema);

		await expect(validate("")).resolves.toBeTruthy(); // truthy bc it has the error message

		await expect(validate("hello world")).resolves.toBeFalsy();
	});

	it("allows passing a context", () =>
		createRoot(async dispose => {
			const [context, setContext] = createSignal({
				hello: "world",
			});
			const schema = string()
				.optional()
				.when((_, schema, { context }) => {
					if (context.hello === "world") {
						return schema.required();
					}

					return schema;
				});

			const options = {
				context,
			};

			const validate = yupField(schema, options);

			await expect(validate("")).resolves.toBeTruthy(); // truthy bc it has the error message

			setContext({ hello: "world!!!", debug: true });

			await expect(validate("")).resolves.toBeFalsy();

			dispose();
		}));
});
