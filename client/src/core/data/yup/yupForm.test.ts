import {
	createFormStore,
	getValue,
	setValue,
	validate,
} from "@modular-forms/solid";
import { describe, expect, it } from "vitest";
import { type InferType, object, string } from "yup";
import { yupForm } from "./yupForm";

describe("yupForm", () => {
	it("validates the form against the schema", async () => {
		const schema = object({
			hello: string().required(),
		});

		const form = createFormStore<InferType<typeof schema>>({
			/// @ts-expect-error: TODO: type error
			validate: yupForm(schema),
		});

		expect(getValue(form, "hello", { shouldActive: false })).toBeFalsy();

		setValue(form, "hello", "");
		await expect(validate(form, { shouldActive: false })).resolves.toEqual(
			false,
		);

		setValue(form, "hello", "world");

		expect(getValue(form, "hello", { shouldActive: false })).toEqual(
			"world",
		);
		await expect(validate(form, { shouldActive: false })).resolves.toEqual(
			true,
		);
	});

	it("allows passing a context", async () => {
		const schema = object({
			hello: string()
				.optional()
				.when((_, schema, { context }) => {
					if (context.hello === "world") {
						return schema.required();
					}

					return schema;
				}),
		});

		const options = {
			context: () => ({
				hello: "world",
			}),
		};

		const form = createFormStore<InferType<typeof schema>>({
			/// @ts-expect-error: TODO: type error
			validate: yupForm(schema, options),
		});

		expect(getValue(form, "hello", { shouldActive: false })).toBeFalsy();

		setValue(form, "hello", "");
		await expect(validate(form, { shouldActive: false })).resolves.toEqual(
			false,
		);

		setValue(form, "hello", "world");
		expect(getValue(form, "hello", { shouldActive: false })).toEqual(
			"world",
		);

		await expect(validate(form, { shouldActive: false })).resolves.toEqual(
			true,
		);
	});
});
