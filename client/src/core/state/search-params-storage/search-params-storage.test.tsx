import { renderHook } from "@solidjs/testing-library";
import { createWithSignal } from "solid-zustand";
import { describe, expect, it } from "vitest";
import { createJSONStorage, persist } from "zustand/middleware";
import { createSearchParamsStorage } from ".";

describe("search-params-storage", () => {
	it("persists state in search params", () => {
		const useStore = createWithSignal<Record<string, any>>(
			persist(
				(set, _get) => ({
					hello: "world",
					actions: {
						addSearchParams: (key: string, value: string) =>
							set({ [key]: value }),
					},
				}),
				{
					name: "test",
					storage: createJSONStorage(createSearchParamsStorage),
				},
			) as any,
		);

		renderHook(() => {
			const value = useStore();

			value().actions.addSearchParams("a", "b");
			value().actions.addSearchParams("some-number", 1);
			value().actions.addSearchParams("has spaces", 2);
		});

		const searchParams = new URLSearchParams(location.search.slice(1));

		expect(Object.fromEntries(searchParams)).toEqual({
			hello: "world",
			a: "b",
			"some-number": "1",
			"has spaces": "2",
		});
	});

	it("ignores values which cannot be serialized", () => {
		const useStore = createWithSignal<Record<string, any>>(
			persist(
				(set, _get) => ({
					hello: "world",
					actions: {
						addSearchParams: (key: string, value: string) =>
							set({ [key]: value }),
					},
				}),
				{
					name: "test",
					storage: createJSONStorage(createSearchParamsStorage),
				},
			) as any,
		);

		renderHook(() => {
			const value = useStore();

			value().actions.addSearchParams("a", () => {});
			value().actions.addSearchParams("some-number", { hello: "world " });
			value().actions.addSearchParams("has spaces", Symbol("test"));
		});

		const searchParams = new URLSearchParams(location.search.slice(1));

		expect(Object.fromEntries(searchParams)).toEqual({
			hello: "world",
		});
	});

	it("removes search params if there are none", () => {
		const useStore = createWithSignal<Record<string, any>>(
			persist(
				(set, _get) => ({
					hello: "world",
					actions: {
						addSearchParams: (key: string, value: string) =>
							set({ [key]: value }),
					},
				}),
				{
					name: "test",
					storage: createJSONStorage(createSearchParamsStorage),
				},
			) as any,
		);

		renderHook(() => {
			const value = useStore();

			value().actions.addSearchParams("hello", "");
		});

		const searchParams = new URLSearchParams(location.search.slice(1));

		expect(Object.fromEntries(searchParams)).toEqual(Object.create(null));
	});
});
