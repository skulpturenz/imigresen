import type { DocHandle } from "@automerge/automerge-repo";
import { createForm, reset, type SubmitHandler } from "@modular-forms/solid";
import { useParams, useSearchParams } from "@solidjs/router";
import { useMutation } from "@tanstack/solid-query";
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

	const [form, { Form, Field, FieldArray }] = createForm<MyPassportForm>({
		validateOn: "change",
		revalidateOn: "change",
	});

	const submit = useMutation(() => ({
		mutationKey: [],
		mutationFn: (_formValues: MyPassportForm) =>
			Promise.resolve(access(handle)?.url),
	}));

	const onSubmit: SubmitHandler<MyPassportForm> = async (
		formValues,
		_event,
	) => {
		if (form.submitting || submit.isPending) {
			return;
		}

		await submit.mutateAsync(formValues);
		reset(form);
	};

	createEffect(() => {
		const initialValues = access(handle)?.doc();

		if (!initialValues) {
			return;
		}

		reset(form, {
			initialValues,
		});
	});

	return {
		handle: () => access(handle),
		form,
		onSubmit,
		Components: {
			Form,
			Field,
			FieldArray,
		},
	};
};

const access = <T>(resource: MaybeResource<T>) =>
	typeof resource === "function" ? (resource as Resource<T>)() : resource;
