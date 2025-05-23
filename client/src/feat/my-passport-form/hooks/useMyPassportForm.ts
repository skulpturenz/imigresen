import type { DocHandle } from "@automerge/automerge-repo";
import { createForm, reset } from "@modular-forms/solid";
import { useParams, useSearchParams } from "@solidjs/router";
import { type MyPassportForm } from "feat/my-passport-form/types";
import { useDocHandle, useRepo } from "solid-automerge";
import { createEffect, type Resource } from "solid-js";

export type MaybeResource<T> = Resource<T> | T;

export const useMyPassportForm = () => {
	const repo = useRepo();

	const routeParams = useParams<{ uuid?: string }>();
	const [searchParams] = useSearchParams<{ automergeUrl?: string }>();

	const getDocHandle = (): MaybeResource<DocHandle<MyPassportForm>> => {
		if (routeParams.uuid && searchParams.automergeUrl) {
			const handle = useDocHandle(undefined, {
				repo,
			}) as Resource<DocHandle<MyPassportForm>>;

			return handle;
		}

		return repo.create<MyPassportForm>({
			hello: "world",
		});
	};
	const handle = getDocHandle();

	const [myPassportForm, { Form, Field, FieldArray }] =
		/// @ts-expect-error: interfaces cause a type error
		// but type declarations are fine for some reason
		createForm<MyPassportForm>({
			validate: "change",
			revalidateOn: "change",
		});

	createEffect(() => {
		const defaultValues = access(handle)?.doc();

		if (!defaultValues) {
			return;
		}

		/// @ts-expect-error: TODO unsure whats causing the type error
		reset(myPassportForm, defaultValues);
	});

	return {
		handle: () => access(handle),
		myPassportForm,
		Components: {
			Form,
			Field,
			FieldArray,
		},
	};
};

const access = <T>(resource: MaybeResource<T>) =>
	typeof resource === "function" ? (resource as Resource<T>)() : resource;
