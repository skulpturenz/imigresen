import type { AutomergeUrl, DocHandle } from "@automerge/automerge-repo";
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
import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { toPath } from "core/router/route";
import { flattenObject, invariant } from "es-toolkit";
import { set } from "es-toolkit/compat";
import { MyPassportFormContext } from "feat/my-passport-form/context";
import type {
	MyPassportForm,
	PassportApplication,
} from "feat/my-passport-form/types";
import { useDocHandle, useRepo } from "solid-automerge";
import {
	createEffect,
	createRenderEffect,
	createSignal,
	onCleanup,
	type Resource,
} from "solid-js";

export type MaybeResource<T> = Resource<T> | T;

export const useMyPassportForm = () => {
	const repo = useRepo();
	const queryClient = useQueryClient();
	const authnContext = useContext(AuthnContext);
	const myPassportFormContext = useContext(MyPassportFormContext);

	const navigate = useNavigate();

	const [show, setShow] = createSignal({
		deleteFrictionDialog: false,
	});
	const toggleDeleteFrictionDialog = () =>
		setShow(show => ({
			...show,
			deleteFrictionDialog: !show.deleteFrictionDialog,
		}));

	const routeParams = useParams<{ uuid?: string }>();
	const [searchParams] = useSearchParams<{ automergeUrl?: string }>();

	const getDocHandle = (): MaybeResource<DocHandle<MyPassportForm>> => {
		if (searchParams.automergeUrl) {
			const handle = useDocHandle(
				searchParams.automergeUrl as AutomergeUrl,
			) as Resource<DocHandle<MyPassportForm>>;

			return handle;
		}

		return repo.create<MyPassportForm>();
	};
	const handle = getDocHandle();

	const [form, { Form, Field, FieldArray }] = createForm<MyPassportForm>({
		get initialValues() {
			if (isResource(handle)) {
				return;
			}

			return handle.doc();
		},
		validateOn: "change",
		revalidateOn: "change",
	});

	const deleteForm = useMutation(() => ({
		mutationFn: myPassportFormContext.deleteApplication,
	}));

	const register = useMutation(() => ({
		mutationFn: myPassportFormContext.registerApplication,
	}));

	const submit = useMutation(() => ({
		mutationFn: (_formValues: MyPassportForm) =>
			Promise.resolve(access(handle)?.url),
	}));

	const onDelete = async () => {
		if (!routeParams.uuid) {
			return;
		}

		await deleteForm.mutateAsync(routeParams.uuid);
		reset(form);

		const existingApplications =
			queryClient.getQueryData<PassportApplication[]>(
				queryKeys.getPassportApplications(
					authnContext().keycloak?.token,
				),
			) ?? [];

		const filteredApplications = existingApplications.filter(
			application => application.uuid !== routeParams.uuid,
		);

		queryClient.setQueryData(
			queryKeys.getPassportApplications(authnContext().keycloak?.token),
			filteredApplications,
		);

		await access(handle)?.whenReady();
		access(handle)?.delete();

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

	createRenderEffect(() => {
		if (!isResource(handle)) {
			return;
		}

		const initialValues = access(handle)?.doc();

		// note: without the timeout does not reset correctly
		setTimeout(
			() =>
				reset(form, {
					initialValues,
					keepDirtyValues: true,
					keepDirty: true,
				}),
			15,
		);
	});

	onCleanup(() => {
		const deleteBlankDocument = async () => {
			if (form.dirty || routeParams.uuid) {
				return;
			}

			await access(handle)?.whenReady();
			access(handle)?.delete();
		};

		deleteBlankDocument();
	});

	onCleanup(() => {
		if (!form.dirty) {
			return;
		}

		const updateExistingFormEntry = () => {
			invariant(
				access(handle)?.url,
				"Automerge URL for existing document is not defined, check `handle`",
			);

			const existingApplications =
				queryClient.getQueryData<PassportApplication[]>(
					queryKeys.getPassportApplications(
						authnContext().keycloak?.token,
					),
				) ?? [];

			const updatedApplications = existingApplications.map(
				application => {
					if (application.uuid === routeParams.uuid) {
						return {
							...application,
							...getValues(form),
						};
					}

					return application;
				},
			);

			queryClient.setQueryData(
				queryKeys.getPassportApplications(
					authnContext().keycloak?.token,
				),
				updatedApplications,
			);
		};

		const registerNewForm = async () => {
			const automergeUrl = access(handle)?.url;

			invariant(
				automergeUrl,
				"Automerge URL is not defined, check `handle`",
			);

			const uuid = await register.mutateAsync(automergeUrl);

			const existingAutomergeUrls =
				queryClient.getQueryData<string[]>(
					queryKeys.getAutomergeUrls(authnContext().keycloak?.token),
				) ?? [];

			const updatedAutomergeUrls = [
				...existingAutomergeUrls,
				automergeUrl,
			];

			queryClient.setQueryData(
				queryKeys.getAutomergeUrls(authnContext().keycloak?.token),
				updatedAutomergeUrls,
			);

			const existingApplications =
				queryClient.getQueryData<PassportApplication[]>(
					queryKeys.getPassportApplications(
						authnContext().keycloak?.token,
					),
				) ?? [];

			const updatedApplications = [
				...existingApplications,
				{
					uuid,
					automergeUrl: access(handle)?.url,
					...getValues(form),
				},
			];

			queryClient.setQueryData(
				queryKeys.getPassportApplications(
					authnContext().keycloak?.token,
				),
				updatedApplications,
			);
		};

		if (routeParams.uuid) {
			updateExistingFormEntry();

			return;
		}

		registerNewForm();
	});

	return {
		show,
		toggleDeleteFrictionDialog,
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

const isResource = (x: unknown): x is Resource<any> =>
	typeof (x as Resource<any>).state !== "undefined" &&
	typeof (x as Resource<any>).loading !== "undefined";
