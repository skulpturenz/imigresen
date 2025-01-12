import { describe, it } from "vitest";

describe("whenOptions", () => {
	it.todo("maps schema when predicate is true");

	it.todo("returns the original schema otherwise");
});

describe("toRequired", () => {
	it.todo("marks the schema as required");
});

describe("toNullish", () => {
	it.todo("marks the schema as optional and nullable");

	it.todo("sets the default value to `null`");
});

describe("hasEveryParentField", () => {
	it.todo("returns `true` if every parent field is not nullish");
});

describe("hasSomeParentField", () => {
	it.todo("return `true` if some parent field is not nullish");
});

describe("isParentFieldEqual", () => {
	it.todo("returns `true` if parent field is equal to specified value");
});
