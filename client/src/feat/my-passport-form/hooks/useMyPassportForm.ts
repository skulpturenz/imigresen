import type { DocHandle } from "@automerge/automerge-repo";
import {
	createForm,
	getValues,
	reset,
	type SubmitHandler,
} from "@modular-forms/solid";
import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { CoreRoute } from "core/constants/core-route.enum";
import { queryKeys } from "core/constants/query-keys";
import { toPath } from "core/router/route";
import { flattenObject } from "es-toolkit";
import { set } from "es-toolkit/compat";
import { type MyPassportForm } from "feat/my-passport-form/types";
import { useDocHandle, useRepo } from "solid-automerge";
import { createEffect, onCleanup, type Resource } from "solid-js";

export type MaybeResource<T> = Resource<T> | T;

export const useMyPassportForm = () => {
	const repo = useRepo();
	const queryClient = useQueryClient();

	const navigate = useNavigate();

	const routeParams = useParams<{ uuid?: string }>();
	const [searchParams] = useSearchParams<{ automergeUrl?: string }>();

	const getDocHandle = (): MaybeResource<DocHandle<MyPassportForm>> => {
		if (searchParams.automergeUrl) {
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

	const deleteForm = useMutation(() => ({
		mutationKey: [],
		mutationFn: (_uuid: string) => Promise.resolve(true),
	}));

	const register = useMutation(() => ({
		mutationKey: [],
		mutationFn: ({
			automergeUrl: _automergeUrl,
			token: _token,
		}: // TODO
		{
			automergeUrl: string;
			token?: string;
		}) => Promise.resolve("uuid"), // TODO
	}));

	const submit = useMutation(() => ({
		mutationKey: [],
		mutationFn: (_formValues: MyPassportForm) =>
			Promise.resolve(access(handle)?.url),
	}));

	const onDelete = async () => {
		if (!routeParams.uuid) {
			return;
		}

		access(handle)?.delete();
		await deleteForm.mutateAsync(routeParams.uuid);
		reset(form);

		navigate(toPath(CoreRoute.Home));
	};

	const onSubmit: SubmitHandler<MyPassportForm> = async (
		formValues,
		_event,
	) => {
		if (form.submitting || submit.isPending) {
			return;
		}

		await submit.mutateAsync(formValues);
		reset(form);

		navigate(toPath(CoreRoute.Home));
	};

	createEffect(() => {
		// TODO: think this would just retrieve all dirty fields
		const dirtyFields = flattenObject(
			getValues(form, {
				shouldDirty: true,
			}),
		);

		if (!import.meta.env.PROD) {
			console.debug("form dirty fields", dirtyFields);
		}

		access(handle)?.change(doc => {
			Object.entries(dirtyFields).forEach(([path, value]) => {
				set(doc, path, value);
			});
		});
	});

	createEffect(() => {
		const initialValues = access(handle)?.doc();

		if (!initialValues) {
			return;
		}

		// TODO: resetting but initial values only show if you navigate away and back??
		reset(form, {
			initialValues,
			keepDirtyValues: true,
			keepDirty: true,
		});
	});

	onCleanup(() => {
		const updateExistingFormEntry = () => {
			const existingApplications = (queryClient.getQueryData(
				queryKeys.getPassportApplications(""),
			) ?? []) as any[];

			const filteredApplications = existingApplications.filter(
				application =>
					application.automergeUrl === searchParams.automergeUrl,
			);

			// TODO: data model
			const updatedApplications = [
				...filteredApplications,
				{
					hello: getValues(form).hello,
					automergeUrl: access(handle)?.url,
				},
			];

			queryClient.setQueryData(
				queryKeys.getPassportApplications(""),
				updatedApplications,
			);
		};

		const registerNewForm = async () => {
			const uuid = await register.mutateAsync({
				automergeUrl: access(handle)?.url as string,
				token: "", // TODO
			});

			const existingApplications = (queryClient.getQueryData(
				queryKeys.getPassportApplications(""),
			) ?? []) as any[];

			const filteredApplications = existingApplications.filter(
				application =>
					application.automergeUrl === searchParams.automergeUrl,
			);

			// TODO: data model
			const updatedApplications = [
				...filteredApplications,
				{
					hello: getValues(form).hello,
					uuid,
					automergeUrl: access(handle)?.url,
				},
			];

			queryClient.setQueryData(
				queryKeys.getPassportApplications(""), // TODO
				updatedApplications,
			);

			// TODO: when creating a new application, a new entry is created api side
			// just to have a uuid for each automerge url, on the home page we retrieve this list
			// of uuids to automerge urls for each user
			// when its all finalized and submitted then the data is normalized and stored away
		};

		if (routeParams.uuid) {
			updateExistingFormEntry();
		} else {
			// TODO: ideally we want to be able to create a form unauthenticated,
			// all stored locally and synced up when authenticated
			// maybe when it syncs up all the local uuids become remote uuids?
			registerNewForm();
		}
	});

	return {
		handle: () => access(handle),
		form,
		onSubmit,
		onDelete,
		isMutating: () => form.submitting || submit.isPending,
		Components: {
			Form,
			Field,
			FieldArray,
		},
	};
};

const access = <T>(resource: MaybeResource<T>) =>
	typeof resource === "function" ? (resource as Resource<T>)() : resource;
