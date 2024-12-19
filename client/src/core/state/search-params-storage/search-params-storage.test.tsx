import { createSearchParamsStorage } from "core/state/search-params-storage";
import { createWithSignal } from "solid-zustand";
import { beforeEach, describe, expect, it } from "vitest";
import { createJSONStorage, persist } from "zustand/middleware";

describe("search-params-storage", () => {
	beforeEach(() => {
		history.replaceState(null, "", "?");
	});

	it("loads state from search params", async () => {
		const initialSearchParams = new URLSearchParams({
			a: "hello",
			b_c_d_e: "world",
		});

		history.replaceState(null, "", `?${initialSearchParams.toString()}`);

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
					merge: persistedState => {
						return persistedState;
					},
				},
			) as any,
		);

		const value = useStore();

		expect(value()).toEqual({
			a: "hello",
			b: {
				c: {
					d: {
						e: "world",
					},
				},
			},
		});
	});

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

		const value = useStore();

		value().actions.addSearchParams("a", "b");
		value().actions.addSearchParams("some-number", 1);
		value().actions.addSearchParams("has spaces", 2);

		const searchParams = new URLSearchParams(location.search.slice(1));

		expect(location.search.slice(1)).toBe(
			"hello=world&a=b&some-number=1&has+spaces=2",
		);
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

		const value = useStore();

		value().actions.addSearchParams("a", () => {});
		value().actions.addSearchParams("some-number", { hello: "world " });
		value().actions.addSearchParams("has spaces", Symbol("test"));

		const searchParams = new URLSearchParams(location.search.slice(1));

		expect(location.search.slice(1)).toBe(
			"hello=world&some-number_hello=world+",
		);
		expect(Object.fromEntries(searchParams)).toEqual({
			hello: "world",
			"some-number_hello": "world ",
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

		const value = useStore();

		value().actions.addSearchParams("hello", "");

		const searchParams = new URLSearchParams(location.search.slice(1));

		expect(Object.fromEntries(searchParams)).toEqual(Object.create(null));
	});
});
