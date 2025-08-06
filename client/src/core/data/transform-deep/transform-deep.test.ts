import { describe, expect, it } from "vitest";
import { transformDeep } from "./transform-deep";
import type { PredicateTransform, TransformFn } from "./types";

describe("transformDeep", () => {
	describe("primitive values", () => {
		it("should transform strings", () => {
			const transform: TransformFn<string, string> = value =>
				typeof value === "string" ? value.toUpperCase() : value;

			const result = transformDeep("hello", { transform });
			expect(result).toBe("HELLO");
		});

		it("should transform numbers", () => {
			const transform: TransformFn<number, number> = value =>
				typeof value === "number" ? value * 2 : value;

			const result = transformDeep(5, { transform });
			expect(result).toBe(10);
		});

		it("should transform booleans", () => {
			const transform: TransformFn<boolean, boolean> = value =>
				typeof value === "boolean" ? !value : value;

			const result = transformDeep(true, { transform });
			expect(result).toBe(false);
		});

		it("should handle null and undefined", () => {
			const transform: TransformFn<any, any> = value =>
				value === null
					? "NULL"
					: value === undefined
						? "UNDEFINED"
						: value;

			expect(transformDeep(null, { transform })).toBe("NULL");
			expect(transformDeep(undefined, { transform })).toBe("UNDEFINED");
		});
	});

	describe("arrays", () => {
		it("should transform arrays of primitives", () => {
			const transform: TransformFn<any, any> = value =>
				typeof value === "string" ? value.toUpperCase() : value;

			const result = transformDeep(["hello", "world"], { transform });
			expect(result).toEqual(["HELLO", "WORLD"]);
		});

		it("should transform nested arrays", () => {
			const transform: TransformFn<any, any> = value =>
				typeof value === "number" ? value * 2 : value;

			const result = transformDeep(
				[
					[1, 2],
					[3, 4],
				],
				{ transform },
			);
			expect(result).toEqual([
				[2, 4],
				[6, 8],
			]);
		});

		it("should transform arrays of mixed types", () => {
			const transform: TransformFn<any, any> = value => {
				if (typeof value === "string") return value.toUpperCase();
				if (typeof value === "number") return value * 2;
				return value;
			};

			const result = transformDeep(["hello", 5, true], { transform });
			expect(result).toEqual(["HELLO", 10, true]);
		});
	});

	describe("objects", () => {
		it("should transform simple objects", () => {
			const transform: TransformFn<any, any> = value =>
				typeof value === "string" ? value.toUpperCase() : value;

			const result = transformDeep(
				{ name: "john", city: "paris" },
				{ transform },
			);
			expect(result).toEqual({ name: "JOHN", city: "PARIS" });
		});

		it("should transform nested objects", () => {
			const transform: TransformFn<any, any> = value =>
				typeof value === "string" ? value.toUpperCase() : value;

			const data = {
				user: {
					name: "john",
					address: {
						city: "paris",
						country: "france",
					},
				},
			};

			const result = transformDeep(data, { transform });
			expect(result).toEqual({
				user: {
					name: "JOHN",
					address: {
						city: "PARIS",
						country: "FRANCE",
					},
				},
			});
		});

		it("should transform objects with arrays", () => {
			const transform: TransformFn<any, any> = value =>
				typeof value === "string" ? value.toUpperCase() : value;

			const data = {
				users: ["alice", "bob"],
				settings: {
					themes: ["dark", "light"],
				},
			};

			const result = transformDeep(data, { transform });
			expect(result).toEqual({
				users: ["ALICE", "BOB"],
				settings: {
					themes: ["DARK", "LIGHT"],
				},
			});
		});
	});

	describe("arrays of objects", () => {
		it("should transform arrays of objects", () => {
			const transform: TransformFn<any, any> = value =>
				typeof value === "string" ? value.toUpperCase() : value;

			const data = [
				{ name: "alice", city: "london" },
				{ name: "bob", city: "paris" },
			];

			const result = transformDeep(data, { transform });
			expect(result).toEqual([
				{ name: "ALICE", city: "LONDON" },
				{ name: "BOB", city: "PARIS" },
			]);
		});
	});

	describe("arrays of nested objects", () => {
		it("should transform arrays of nested objects", () => {
			const transform: TransformFn<any, any> = value =>
				typeof value === "string" ? value.toUpperCase() : value;

			const data = [
				{
					user: { name: "alice" },
					posts: [{ title: "hello" }, { title: "world" }],
				},
				{
					user: { name: "bob" },
					posts: [{ title: "foo" }, { title: "bar" }],
				},
			];

			const result = transformDeep(data, { transform });
			expect(result).toEqual([
				{
					user: { name: "ALICE" },
					posts: [{ title: "HELLO" }, { title: "WORLD" }],
				},
				{
					user: { name: "BOB" },
					posts: [{ title: "FOO" }, { title: "BAR" }],
				},
			]);
		});
	});

	describe("Sets and Maps", () => {
		it("should transform Sets", () => {
			const transform: TransformFn<any, any> = value =>
				typeof value === "string" ? value.toUpperCase() : value;

			const data = new Set(["hello", "world"]);
			const result = transformDeep(data, { transform });

			expect(result).toBeInstanceOf(Set);
			expect(Array.from(result as Set<string>)).toEqual([
				"HELLO",
				"WORLD",
			]);
		});

		it("should transform Maps", () => {
			const transform: TransformFn<any, any> = value =>
				typeof value === "string" ? value.toUpperCase() : value;

			const data = new Map([
				["key1", "value1"],
				["key2", "value2"],
			]);
			const result = transformDeep(data, { transform });

			expect(result).toBeInstanceOf(Map);
			const resultMap = result as Map<string, string>;
			expect(resultMap.get("KEY1")).toBe("VALUE1");
			expect(resultMap.get("KEY2")).toBe("VALUE2");
		});
	});

	describe("transformer function context", () => {
		it("should provide key and parent context", () => {
			const calls: Array<{
				value: any;
				key?: string | number;
				parent?: any;
			}> = [];

			const transform: TransformFn<any, any> = (value, key, parent) => {
				calls.push({ value, key, parent });
				return value;
			};

			transformDeep({ name: "john", age: 30 }, { transform });

			// Should have calls for the object itself and its properties
			expect(calls).toHaveLength(3);
			expect(calls[0]).toEqual({
				value: "john",
				key: "name",
				parent: { name: "john", age: 30 },
			});
			expect(calls[1]).toEqual({
				value: 30,
				key: "age",
				parent: { name: "john", age: 30 },
			});
			expect(calls[2]).toEqual({
				value: { name: "john", age: 30 },
				key: undefined,
				parent: undefined,
			});
		});
	});

	describe("maxDepth option", () => {
		it("should respect maxDepth limit", () => {
			const transform: TransformFn<any, any> = value =>
				typeof value === "string" ? value.toUpperCase() : value;

			const data = {
				level1: {
					level2: {
						level3: "deep",
					},
				},
			};

			const result = transformDeep(data, { transform, maxDepth: 2 });

			// Should transform up to level 2, but not level 3
			expect(result.level1.level2.level3).toBe("deep"); // Not transformed
		});
	});

	describe("preserveReferences option", () => {
		it("should handle circular references when preserveReferences is true", () => {
			const obj: any = { name: "test" };
			obj.self = obj;

			const transform: TransformFn<any, any> = value =>
				typeof value === "string" ? value.toUpperCase() : value;

			const result = transformDeep(obj, {
				transform,
				preserveReferences: true,
			});

			expect(result.name).toBe("TEST");
			expect(result.self).toBe(result); // Should maintain circular reference
		});
	});

	describe("complex API response scenarios", () => {
		it("should handle typical API response structure", () => {
			const apiResponse = {
				data: [
					{
						id: 1,
						user: {
							name: "john doe",
							email: "john@example.com",
							profile: {
								bio: "software developer",
								skills: ["javascript", "typescript"],
								preferences: {
									theme: "dark",
									language: "en",
								},
							},
						},
						posts: [
							{
								title: "my first post",
								content: "hello world",
								tags: ["intro", "hello"],
							},
						],
					},
				],
				meta: {
					total: 1,
					status: "success",
				},
			};

			// Transform to camelCase
			const toCamelCase = (str: string): string =>
				str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

			const transform: TransformFn<any, any> = value => {
				if (typeof value === "string") {
					return toCamelCase(value);
				}
				return value;
			};

			const result = transformDeep(apiResponse, { transform });

			expect(result.data[0].user.name).toBe("johnDoe");
			expect(result.data[0].user.profile.bio).toBe("softwareDeveloper");
			expect(result.data[0].posts[0].title).toBe("myFirstPost");
			expect(result.meta.status).toBe("success");
		});
	});

	describe("predicate-based transformations", () => {
		it("should apply different transforms based on predicates", () => {
			const transforms: PredicateTransform<any, any>[] = [
				{
					predicate: value =>
						typeof value === "string" && value.startsWith("user_"),
					transform: value => value.replace("user_", "USER-"),
				},
				{
					predicate: value =>
						typeof value === "string" && value.startsWith("role_"),
					transform: value => value.replace("role_", "ROLE-"),
				},
				{
					predicate: value => typeof value === "number",
					transform: value => value * 10,
				},
			];

			const data = {
				id: "user_123",
				permission: "role_admin",
				count: 5,
				name: "john",
			};

			const result = transformDeep(data, { transforms });

			expect(result).toEqual({
				id: "USER-123",
				permission: "ROLE-admin",
				count: 50,
				name: "john", // No matching predicate, unchanged
			});
		});

		it("should use defaultTransform when no predicate matches", () => {
			const transforms: PredicateTransform<any, any>[] = [
				{
					predicate: value => typeof value === "number",
					transform: value => value * 2,
				},
			];

			const defaultTransform: TransformFn<any, any> = value =>
				typeof value === "string" ? value.toUpperCase() : value;

			const data = {
				count: 5,
				name: "alice",
				active: true,
			};

			const result = transformDeep(data, {
				transforms,
				defaultTransform,
			});

			expect(result).toEqual({
				count: 10, // Number transformed by predicate
				name: "ALICE", // String transformed by default
				active: true, // Boolean transformed by default (no change)
			});
		});

		it("should work with complex data structures and predicates", () => {
			const transforms: PredicateTransform<any, any>[] = [
				{
					predicate: (value, key) => key === "email",
					transform: value => value.toLowerCase(),
				},
				{
					predicate: (value, key, parent) =>
						Array.isArray(parent) &&
						typeof value === "object" &&
						value.type === "user",
					transform: value => ({
						...value,
						category: "USER_PROFILE",
					}),
				},
				{
					predicate: value => value instanceof Date,
					transform: value => value.toISOString(),
				},
			];

			const data = {
				users: [
					{
						type: "user",
						email: "ALICE@EXAMPLE.COM",
						createdAt: new Date("2023-01-01"),
					},
					{
						type: "admin",
						email: "BOB@EXAMPLE.COM",
						createdAt: new Date("2023-01-02"),
					},
				],
				lastUpdated: new Date("2023-01-03"),
			};

			const result = transformDeep(data, { transforms });

			expect(result.users[0]).toEqual({
				type: "user",
				email: "alice@example.com",
				createdAt: "2023-01-01T00:00:00.000Z",
				category: "USER_PROFILE",
			});

			expect(result.users[1]).toEqual({
				type: "admin",
				email: "bob@example.com",
				createdAt: "2023-01-02T00:00:00.000Z",
				// No category added since type !== "user"
			});

			expect(result.lastUpdated).toBe("2023-01-03T00:00:00.000Z");
		});

		it("should work with Maps having any key types", () => {
			const transforms: PredicateTransform<any, any>[] = [
				{
					predicate: value => value instanceof Map,
					transform: value => {
						const newMap = new Map();
						for (const [k, v] of value) {
							// Transform the map by prefixing string values
							newMap.set(
								k,
								typeof v === "string" ? `transformed_${v}` : v,
							);
						}
						return newMap;
					},
				},
			];

			// Create a Map with various key types
			const complexKey = { id: 1 };
			const dateKey = new Date("2023-01-01");
			const numberKey = 42;

			const data = new Map([
				[complexKey, "value1"],
				[dateKey, "value2"],
				[numberKey, 100],
				["stringKey", "value3"],
			]);

			const result = transformDeep(data, { transforms });

			expect(result).toBeInstanceOf(Map);
			expect(result.get(complexKey)).toBe("transformed_value1");
			expect(result.get(dateKey)).toBe("transformed_value2");
			expect(result.get(numberKey)).toBe(100); // Number unchanged
			expect(result.get("stringKey")).toBe("transformed_value3");
		});

		it("should maintain backward compatibility with single transform", () => {
			const transform: TransformFn<any, any> = value =>
				typeof value === "string" ? value.toUpperCase() : value;

			const data = { name: "alice", age: 30 };
			const result = transformDeep(data, { transform });

			expect(result).toEqual({ name: "ALICE", age: 30 });
		});

		it("should handle nested structures with predicate context", () => {
			const transforms: PredicateTransform<any, any>[] = [
				{
					predicate: (value, key, parent) =>
						key === "name" && parent && parent.type === "premium",
					transform: value => `⭐ ${value}`,
				},
				{
					predicate: (value, key, parent) =>
						key === "name" && parent && parent.type === "basic",
					transform: value => `• ${value}`,
				},
			];

			const data = {
				users: [
					{
						type: "premium",
						name: "alice",
						email: "alice@example.com",
					},
					{ type: "basic", name: "bob", email: "bob@example.com" },
					{
						type: "guest",
						name: "charlie",
						email: "charlie@example.com",
					},
				],
			};

			const result = transformDeep(data, { transforms });

			expect(result.users[0].name).toBe("⭐ alice");
			expect(result.users[1].name).toBe("• bob");
			expect(result.users[2].name).toBe("charlie"); // No matching predicate
		});

		it("should handle predicate order priority (first match wins)", () => {
			const transforms: PredicateTransform<any, any>[] = [
				{
					predicate: value => typeof value === "string",
					transform: value => `FIRST: ${value}`,
				},
				{
					predicate: value =>
						typeof value === "string" && value.length > 5,
					transform: value => `SECOND: ${value}`,
				},
			];

			const result = transformDeep("hello world", { transforms });

			// Should use first transform since it matches first
			expect(result).toBe("FIRST: hello world");
		});
	});
});
