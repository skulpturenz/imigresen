import { describe, expect, it, vi } from "vitest";
import { getRedirectPath } from "./utils";

describe("getRedirectPath", () => {
	it("gets correct relative url with hash and search params preserved", () => {
		vi.spyOn(window, "location", "get").mockReturnValue({
			origin: "https://test.com:1234",
			hash: "#ignored",
			search: `?${new URLSearchParams({ hello: "world" }).toString()}`,
		} as any);

		const redirectPath = getRedirectPath({
			redirectPath: "/test#preserved",
			world: "hello",
		});

		expect(redirectPath).toBe("/test?world=hello#preserved");
	});
});
