import type { AnyDocumentId, Doc } from "@automerge/automerge-repo";
import {
	createForm,
	getValue,
	getValues,
	reset,
	validate,
	type SubmitHandler,
} from "@modular-forms/solid";
import {
	useBeforeLeave,
	useNavigate,
	useParams,
	useSearchParams,
} from "@solidjs/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { selectMyPassportForm } from "common/epic/my-passport-form/select/select-my-passport-form";
import { MyPassportFormVersionLatest } from "common/epic/my-passport-form/types";
import { CoreRoute } from "core/constants/core-route.enum";
import { queryKeys as globalQueryKeys } from "core/constants/query-keys";
import { AuthnContext } from "core/context/authn";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { yupForm } from "core/data/yup/yup-form";
import { toPath } from "core/router/utils";
import { flattenObject, invariant, isEqualWith } from "es-toolkit";
import { set } from "es-toolkit/compat";
import { MyPassportFormContext } from "feat/my-passport-form/context";
import { queryKeys } from "feat/my-passport-form/resources/query-keys";
import { myPassportForm } from "feat/my-passport-form/spec";
import {
	MyPassportFormMode,
	type DropdownOptions,
	type FormContext,
	type MyPassportForm,
} from "feat/my-passport-form/types";
import { useRepo } from "solid-automerge";
import {
	createEffect,
	createResource,
	createSignal,
	type Resource,
} from "solid-js";

export type MaybeResource<T> = Resource<T> | T;

export const useMyPassportForm = () => {
	const repo = useRepo();
	const queryClient = useQueryClient();
	const authnContext = useContext(AuthnContext);
	const userContext = useContext(UserContext);
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

	const selectReferenceData = (): DropdownOptions | null => {
		if (!qReferenceData.data) {
			return null;
		}

		return {
			...qReferenceData.data,
			personalDetailsStateOptions:
				qReferenceDataPersonalDetailsStates.data ?? ([] as string[]),
			addressDetailsStateOptions:
				qReferenceDataAddressDetailsStates.data ?? ([] as string[]),
		};
	};

	const [formContext, setFormContext] = createSignal<FormContext>({
		// TODO: change to `Draft`
		mode: MyPassportFormMode.Published,
		dropdownOptions: selectReferenceData,
	});
	const publish = () =>
		setFormContext(formContext => ({
			...formContext,
			mode: MyPassportFormMode.Published,
		}));

	const [form, { Form, Field, FieldArray }] = createForm<MyPassportForm>({
		/// @ts-expect-error: type error only between `Maybe<string>` and `undefined`, etc
		validate: yupForm(myPassportForm, {
			context: formContext,
		}),
		validateOn: "change",
		revalidateOn: "change",
	});

	const qReferenceData = useQuery<DropdownOptions>(() => ({
		queryKey: queryKeys.getReferenceData(authnContext().keycloak?.token),
		queryFn: myPassportFormContext.getReferenceData,
		staleTime: Infinity,
	}));

	const qReferenceDataPersonalDetailsStates = useQuery<string[]>(() => ({
		queryKey: queryKeys.getReferenceDataStates(
			getValue(form, "personalDetails.countryOfBirthCode") ?? "",
			authnContext().keycloak?.token,
		),
		queryFn: myPassportFormContext.getReferenceDataStates,
		placeholderData: [],
		staleTime: Infinity,
	}));

	const qReferenceDataAddressDetailsStates = useQuery<string[]>(() => ({
		queryKey: queryKeys.getReferenceDataStates(
			getValue(form, "addressDetails.countryCode") ?? "",
			authnContext().keycloak?.token,
		),
		queryFn: myPassportFormContext.getReferenceDataStates,
		placeholderData: [],
		staleTime: Infinity,
	}));

	const [handle] = createResource(async () => {
		// not ideal that we are performing side effects here
		// but we don't want the page to load until we've set the initial data
		const resetFormValues = (doc: Doc<MyPassportForm>) => {
			if (!import.meta.env.PROD) {
				console.debug("initialValues", doc);
			}

			reset(form, {
				initialValues: doc,
			});
		};

		if (searchParams.automergeUrl) {
			const handle = await repo.find<MyPassportForm>(
				searchParams.automergeUrl as AnyDocumentId,
			);

			await handle.whenReady();

			const doc = selectMyPassportForm(handle.doc());

			resetFormValues(doc);

			return handle;
		}

		const handle = repo.create<Partial<MyPassportForm>>({
			version: MyPassportFormVersionLatest,
		});

		await handle.whenReady();

		return handle;
	});

	// the default comparison between form values and initial values
	// just checks if the form values are not equal to the initial values
	// but when it comes to forms we want to treat falsy values the same regardless
	// of what type it is
	// - sometimes initial values starts with `null` and when the form is edited it becomes
	// a an empty string, both are empty and we treat the form as not modified. mainly select
	// options which are reference types
	const isDirty = () => {
		if (!form.dirty) {
			return false;
		}

		return !isEqualWith(
			getValues(form),
			form.internal.initialValues,
			(final, initial) => {
				// handle falsy values separately
				if (!final && !initial) {
					return false;
				}

				// use default equality comparison
				// should handle objects and arrays
				return undefined;
			},
		);
	};

	const mDeleteForm = useMutation(() => ({
		mutationFn: myPassportFormContext.deleteApplication,
	}));

	const mRegister = useMutation(() => ({
		mutationFn: myPassportFormContext.registerApplication,
	}));

	const mSubmit = useMutation(() => ({
		mutationFn: (_formValues: MyPassportForm) =>
			Promise.resolve(handle()?.url),
	}));

	const onDelete = async () => {
		if (!routeParams.uuid) {
			return;
		}

		await mDeleteForm.mutateAsync({
			uuid: routeParams.uuid,
			user: userContext().profile?.uuid,
		});
		reset(form);

		queryClient.refetchQueries({
			queryKey: globalQueryKeys.getPassportApplications(
				authnContext().keycloak?.token,
			),
		});

		await handle()?.whenReady();
		repo.delete(handle()?.documentId as AnyDocumentId);

		navigate(toPath(CoreRoute.Home));
	};

	const onSubmit: SubmitHandler<MyPassportForm> = async (
		formValues,
		_event,
	) => {
		publish();

		const isValid = await validate(form);

		if (!isValid) {
			return;
		}

		if (form.submitting || mSubmit.isPending) {
			return;
		}

		await mSubmit.mutateAsync(formValues);
		reset(form);

		navigate(toPath(CoreRoute.Home));
	};

	createEffect(() => {
		if (handle.loading) {
			return;
		}

		const dirtyFields = flattenObject(
			getValues(form, {
				shouldDirty: true,
			}),
		);

		if (!import.meta.env.PROD) {
			console.debug("form dirty fields", dirtyFields);
		}

		handle()?.change(doc => {
			Object.entries(dirtyFields).forEach(([path, value]) => {
				if (!import.meta.env.PROD) {
					console.debug("set", path, value);
				}

				set(doc, path, value);
			});
		});
	});

	useBeforeLeave(event => {
		if (
			event.defaultPrevented ||
			event.from.pathname !== window.location.pathname
		) {
			return;
		}

		const currentUuid = routeParams.uuid;
		const proceed = () => event.retry(true);

		if (isDirty() || currentUuid) {
			return;
		}

		event.preventDefault();

		const deleteBlankDocument = async () => {
			await handle()?.whenReady();
			handle()?.delete();
		};

		deleteBlankDocument().then(proceed);
	});

	useBeforeLeave(event => {
		if (
			event.defaultPrevented ||
			event.from.pathname !== window.location.pathname
		) {
			return;
		}

		const currentUuid = routeParams.uuid;
		const proceed = () => event.retry(true);

		if (!isDirty() || !currentUuid) {
			return;
		}

		event.preventDefault();

		const refetchPassportApplications = async () => {
			invariant(
				handle()?.url,
				"Automerge URL for existing document is not defined, check `handle`",
			);

			await queryClient.refetchQueries({
				queryKey: globalQueryKeys.getPassportApplications(
					authnContext().keycloak?.token,
				),
			});
		};

		refetchPassportApplications().then(proceed);
	});

	useBeforeLeave(event => {
		if (
			event.defaultPrevented ||
			event.from.pathname !== window.location.pathname
		) {
			return;
		}

		const currentUuid = routeParams.uuid;
		const proceed = () => event.retry(true);

		if (!isDirty() || currentUuid) {
			return;
		}

		event.preventDefault();

		const registerNewForm = async () => {
			const automergeUrl = handle()?.url;

			invariant(
				automergeUrl,
				"Automerge URL is not defined, check `handle`",
			);

			await mRegister.mutateAsync({
				automergeUrl: automergeUrl,
				user: userContext().profile?.uuid,
			});

			await queryClient.refetchQueries({
				queryKey: globalQueryKeys.getPassportApplications(
					authnContext().keycloak?.token,
				),
			});
		};

		registerNewForm().then(proceed);
	});

	return {
		data: {
			referenceData: selectReferenceData,
		},
		show,
		toggleDeleteFrictionDialog,
		handle,
		form,
		onSubmit,
		onDelete,
		isMutating: () => form.submitting || mSubmit.isPending,
		isDirty,
		Components: {
			Form,
			Field,
			FieldArray,
		},
	};
};
