import { isPlainObject } from "es-toolkit";
import { describe, expect, it } from "vitest";
import {
	createConformer,
	isCircularReference,
	transformDeep,
	unwrap,
} from "./transform-deep";
import type { CircularReferentialResult } from "./types";

describe("transformDeep", () => {
	describe("primitive values", () => {
		const PRIMITIVE_VALUES = ["string", 0, true, null, undefined].map(
			value => ({
				value,
				expected: `${value}`,
				type: value === null ? "null" : typeof value,
			}),
		);

		PRIMITIVE_VALUES.forEach(({ value, expected, type }) => {
			it(type, () => {
				const result = transformDeep(
					value,
					createConformer((value: any) => `${value}`),
				);
				expect(result).toBe(expected);
			});
		});
	});

	describe("arrays", () => {
		it("transforms arrays of primitives", () => {
			const arr = ["string", 0, true, null, undefined];

			const result = transformDeep(arr, [
				createConformer(
					(value: any) => `${value}`,
					value => !Array.isArray(value),
				),
			]);

			expect(result).toEqual([
				"string",
				"0",
				"true",
				"null",
				"undefined",
			]);
		});

		it("transforms deeply nested arrays", () => {
			const arr = Array.from({ length: 100 }, (_, i) => i).reduce<any>(
				(acc, x) => [[...acc, x]],
				[],
			);

			const result = transformDeep(arr, [
				createConformer(
					(value: any) => value,
					value => !Array.isArray(value),
				),
				createConformer(
					(value: any[]) => value.flatMap(v => v),
					value => Array.isArray(value),
				),
			]);

			expect(Array.from({ length: 100 }, (_, i) => i)).toEqual(result);
		});
	});

	describe("objects", () => {
		it("transforms values", () => {
			const record = { a: "b", c: "d" };

			const result = transformDeep(
				record,
				createConformer(
					(value: string) => value.toUpperCase(),
					value => !isPlainObject(value),
				),
			);

			expect(result).toEqual({
				a: "B",
				c: "D",
			});
		});

		it("transforms deeply nested objects", () => {
			const record = Array.from({ length: 100 }, (_, i) => i).reduce<any>(
				(acc, x) => {
					if (Object.keys(acc).length) {
						return { acc };
					}

					return { x };
				},
				Object.create(null),
			);

			const result = transformDeep(record, [
				createConformer(
					(value: string) => value + 1,
					value => !isPlainObject(value),
				),
				createConformer((value: Record<string, any>) => {
					if (value.acc) {
						return value.acc;
					}

					return value;
				}, isPlainObject),
			]);

			expect(result).toEqual({ x: 1 });
		});
	});

	describe("arrays + objects", () => {
		it("simple", () => {
			const arr = [
				{ a: "b", c: "d" },
				{ a: "b", c: "d" },
			];

			const result = transformDeep(arr, [
				createConformer(
					(value: string) => value.toUpperCase(),
					value => !isPlainObject(value) && !Array.isArray(value),
				),
			]);

			expect(result).toEqual([
				{ a: "B", c: "D" },
				{ a: "B", c: "D" },
			]);
		});

		it("nested", () => {
			const record = Array.from({ length: 100 }, (_, i) => i).reduce<any>(
				(acc, x) => {
					if (Object.keys(acc).length) {
						return { acc };
					}

					return { x };
				},
				Object.create(null),
			);
			const arr = Array.from({ length: 100 }, (_, i) => i).reduce<any>(
				(acc, _) => {
					if (!acc.length) {
						return [...acc, record];
					}

					return [acc];
				},
				[],
			);

			const result = transformDeep(arr, [
				createConformer(
					(value: string) => value + 1,
					value => !isPlainObject(value) && !Array.isArray(value),
				),
				createConformer((value: Record<string, any>) => {
					if (value.acc) {
						return value.acc;
					}

					return value;
				}, isPlainObject),
				createConformer(
					(value: any[]) => value.flatMap(v => v),
					value => Array.isArray(value),
				),
			]);

			expect(result).toEqual([{ x: 1 }]);
		});
	});

	describe("sets", () => {
		it("transforms set of primitives", () => {
			const set = new Set(["string", 0, true, null, undefined]);

			const result = transformDeep(set, [
				createConformer(
					(value: any) => `${value}`,
					value => !(value instanceof Set),
				),
			]);

			expect(result).toEqual(
				new Set(["string", "0", "true", "null", "undefined"]),
			);
		});

		it("transforms deeply nested sets", () => {
			const set = Array.from({ length: 100 }, (_, i) => i).reduce<any>(
				(acc, x) => new Set([...acc, x]),
				new Set(),
			);

			const result = transformDeep(set, [
				createConformer(
					(value: any) => value,
					value => !Array.isArray(value),
				),
				createConformer(
					(value: any[]) => value.flatMap(v => v),
					value => Array.isArray(value),
				),
			]);

			expect(new Set(Array.from({ length: 100 }, (_, i) => i))).toEqual(
				result,
			);
		});
	});

	describe("maps", () => {
		it("transforms values", () => {
			const map = new Map(Object.entries({ a: "b", c: "d" }));

			const result = transformDeep(
				map,
				createConformer(
					(value: string) => value.toUpperCase(),
					value => !(value instanceof Map),
				),
			);

			expect(result).toEqual(
				new Map(
					Object.entries({
						a: "B",
						c: "D",
					}),
				),
			);
		});

		it("transforms deeply nested maps", () => {
			const map = Array.from({ length: 100 }, (_, i) => i).reduce(
				(acc, x) => {
					if (acc.size) {
						return new Map([["acc", acc]]);
					}

					return new Map([["x", x]]);
				},
				new Map(),
			);

			const result = transformDeep(map, [
				createConformer(
					(value: string) => value + 1,
					value => !(value instanceof Map),
				),
				createConformer(
					(value: Map<any, any>) => {
						if (value.has("acc")) {
							return value.get("acc");
						}

						return value;
					},
					value => value instanceof Map,
				),
			]);

			expect(result).toEqual(new Map(Object.entries({ x: 1 })));
		});
	});

	describe("conformer context", () => {
		it("predicate access keys", () => {
			const record = { a: "b", c: "d" };

			const resultSingleConformer = transformDeep(
				record,
				createConformer(
					(value: string) => value.toUpperCase(),
					(value, context) =>
						!isPlainObject(value) && context?.key !== "a",
				),
			);
			const resultMultipleConformers = transformDeep(record, [
				createConformer(
					(value: string) => value.toUpperCase(),
					(value, context) =>
						!isPlainObject(value) && context?.key !== "a",
				),
			]);

			expect(resultSingleConformer).toEqual({
				a: "b",
				c: "D",
			});
			expect(resultMultipleConformers).toEqual(resultSingleConformer);
		});

		it("predicate access index", () => {
			const arr = ["string", 0, true, null, undefined];

			const resultSingleConformer = transformDeep(
				arr,
				createConformer(
					(value: any) => `${value}`,
					(value, context) => {
						console.log(context);
						return !Array.isArray(value) && context?.key !== 1;
					},
				),
			);
			const resultMultipleConformers = transformDeep(arr, [
				createConformer(
					(value: any) => `${value}`,
					(value, context) => {
						console.log(context);
						return !Array.isArray(value) && context?.key !== 1;
					},
				),
			]);

			expect(resultSingleConformer).toEqual([
				"string",
				0,
				"true",
				"null",
				"undefined",
			]);
			expect(resultMultipleConformers).toEqual(resultSingleConformer);
		});

		it("predicate access parent", () => {
			const record = {
				a: "b",
				nested: {
					c: "d",
				},
			};

			const result = transformDeep(
				record,
				createConformer(
					(value: string) => value.toUpperCase(),
					(value, context) =>
						!isPlainObject(value) && !(context?.parent as any).c,
				),
			);

			expect(result).toEqual({
				a: "B",
				nested: {
					c: "d",
				},
			});
		});
	});

	it("circular references", () => {
		const record: Record<string, any> = { a: "b", c: { d: "e" } };
		record.self = record;
		record.c.self = record.c;

		expect(() =>
			transformDeep(record, [
				createConformer(
					(value: string) => value.toUpperCase(),
					value => !isPlainObject(value),
				),
				createConformer((value: Record<string, any>) => {
					if (value.acc) {
						return value.acc;
					}

					return value;
				}, isPlainObject),
			]),
		).not.toThrowError();

		const result = transformDeep(record, [
			createConformer(
				(value: string) => value.toUpperCase(),
				value => !isPlainObject(value),
			),
			createConformer((value: Record<string, any>) => {
				if (value.acc) {
					return value.acc;
				}

				return value;
			}, isPlainObject),
		]) as CircularReferentialResult<Record<string, any>>;

		expect(result.__meta__?.hasCircularReference).toBeTruthy();
		expect(isCircularReference(result.self)).toBeTruthy();

		expect(unwrap(result)).toBe(result);

		expect(unwrap(result.self)).toEqual(result);
		expect(unwrap(result.self)).toBe(result);

		expect(unwrap(result.c.self)).toEqual(result.c);
		expect(unwrap(result.c.self)).toBe(result.c);
	});
});
