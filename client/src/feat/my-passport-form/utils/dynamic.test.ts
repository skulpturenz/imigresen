import { describe, expect, it } from "vitest";
import { dynamic } from "./dynamic";

describe("dynamic", () => {
	it("has statically known keys and dynamically known values", () => {
		enum Test {
			A = 1,
			/* eslint-disable-next-line  @typescript-eslint/no-duplicate-enum-values */
			B = 1,
		}

		const data = {
			A: "a",
			B: "b",
		};

		const combined = dynamic(Test, data);

		expect(combined.A).toBe(data.A);
		expect(combined.B).toBe(data.B);
	});

	describe("reverse maps if possible", () => {
		it("if possible", () => {
			enum Test {
				A = 1,
				/* eslint-disable-next-line  @typescript-eslint/no-duplicate-enum-values */
				B = 1,
			}

			const data = {
				A: "a",
				B: "b",
			};

			const combined = dynamic(Test, data) as Record<string, any>;

			expect(combined["a"]).toBe("A");
			expect(combined["b"]).toBe("B");
		});

		it("if not possible", () => {
			enum Test {
				A = 1,
				/* eslint-disable-next-line  @typescript-eslint/no-duplicate-enum-values */
				B = 1,
			}

			const data = {
				A: "a",
				B: "a",
			};

			const combined = dynamic(Test, data) as Record<string, any>;

			expect(combined["a"]).toBeFalsy();
		});
	});

	it("throws if key in static definition is not present", () => {
		enum Test {
			A = 1,
			/* eslint-disable-next-line  @typescript-eslint/no-duplicate-enum-values */
			B = 1,
		}

		const data = {
			A: "a",
		} as Record<string, any>;

		expect(() => dynamic(Test, data)).toThrowError();
	});
});
