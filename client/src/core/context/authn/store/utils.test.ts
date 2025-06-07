import { describe, expect, it, vi } from "vitest";
import { createRedirectUrl } from "./utils";

describe("createRedirectUrl", () => {
	it("no path, hash or params", () => {
		vi.spyOn(window, "location", "get").mockReturnValue({
			hash: "",
			search: "",
		} as any);

		const redirectUrl = createRedirectUrl("https://test.com");

		expect(redirectUrl.searchParams.get("redirectPath")).toBeFalsy();
	});

	it("path", () => {
		vi.spyOn(window, "location", "get").mockReturnValue({
			hash: "",
			search: "",
		} as any);

		const redirectUrl = createRedirectUrl("https://test.com", "/test");

		expect(redirectUrl.searchParams.get("redirectPath")).toBe("/test");
	});

	it("hash", () => {
		vi.spyOn(window, "location", "get").mockReturnValue({
			hash: "#test",
			search: "",
		} as any);

		const redirectUrl = createRedirectUrl("https://test.com");

		expect(redirectUrl.searchParams.get("redirectPath")).toBe("#test");
	});

	it("params", () => {
		vi.spyOn(window, "location", "get").mockReturnValue({
			hash: "",
			search: `?${new URLSearchParams({ hello: "world" }).toString()}`,
		} as any);

		const redirectUrl = createRedirectUrl("https://test.com");

		expect(redirectUrl.searchParams.get("hello")).toBe("world");
	});

	it("path + hash", () => {
		vi.spyOn(window, "location", "get").mockReturnValue({
			hash: "#world",
			search: "",
		} as any);

		const redirectUrl = createRedirectUrl("https://test.com", "/hello");

		expect(redirectUrl.searchParams.get("redirectPath")).toBe(
			"/hello#world",
		);
	});

	it("path + hash + params", () => {
		vi.spyOn(window, "location", "get").mockReturnValue({
			hash: "#world",
			search: `?${new URLSearchParams({ hello: "world" }).toString()}`,
		} as any);

		const redirectUrl = createRedirectUrl("https://test.com", "/hello");

		expect(redirectUrl.searchParams.get("redirectPath")).toBe(
			"/hello#world",
		);
		expect(redirectUrl.searchParams.get("hello")).toBe("world");
	});
});
