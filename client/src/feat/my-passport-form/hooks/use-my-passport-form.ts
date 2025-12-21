import type { AnyDocumentId, Doc } from "@automerge/automerge-repo";
import {
	createForm,
	focus,
	getValues,
	reset,
	validate,
	type SubmitHandler,
} from "@modular-forms/solid";
import {
	useBeforeLeave,
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
	type BeforeLeaveEventArgs,
} from "@solidjs/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { selectMyPassportForm } from "common/epic/my-passport-form/select/select-my-passport-form";
import {
	MyPassportFormStatus,
	MyPassportFormVersionLatest,
} from "common/epic/my-passport-form/types";
import { CoreRoute } from "core/constants/core-route.enum";
import { queryKeys as globalQueryKeys } from "core/constants/query-keys";
import { AuthnContext } from "core/context/authn";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { yupForm } from "core/data/yup/yup-form";
import { useDebug } from "core/hooks/use-debug";
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
import { withCustomTransform } from "feat/my-passport-form/utils/with-custom-transform";
import { useRepo } from "solid-automerge";
import {
	createEffect,
	createResource,
	createSignal,
	getOwner,
	type Accessor,
	type Resource,
} from "solid-js";
import { toHash, toStep } from "./use-wizard-steps";

export type MaybeResource<T> = Resource<T> | T;

export interface UseMyPassportFormProps {
	stepStatus: Accessor<any>;
}

export const useMyPassportForm = (props: UseMyPassportFormProps) => {
	const repo = useRepo();
	const queryClient = useQueryClient();
	const authnContext = useContext(AuthnContext);
	const userContext = useContext(UserContext);
	const myPassportFormContext = useContext(MyPassportFormContext);
	const $debug = useDebug();

	const navigate = useNavigate();

	const [show, setShow] = createSignal({
		deleteFrictionDialog: false,
		invalidDataDialog: false,
	});
	const toggleDeleteFrictionDialog = () =>
		setShow(show => ({
			...show,
			deleteFrictionDialog: !show.deleteFrictionDialog,
		}));
	const toggleInvalidDataDialog = () =>
		setShow(show => ({
			...show,
			invalidDataDialog: !show.invalidDataDialog,
		}));

	const routeParams = useParams<{ uuid?: string }>();
	const [searchParams] = useSearchParams<{ automergeUrl?: string }>();
	const location = useLocation();
	const isOnboarding = () => location.pathname === `/${CoreRoute.Home}`;

	const [formContext, setFormContext] = createSignal<FormContext>({
		mode: MyPassportFormMode.Draft,
		dropdownOptions: () => qReferenceData.data ?? null,
	});
	const publish = () =>
		setFormContext(formContext => ({
			...formContext,
			mode: MyPassportFormMode.Published,
		}));
	const draft = () =>
		setFormContext(formContext => ({
			...formContext,
			mode: MyPassportFormMode.Draft,
		}));

	const owner = getOwner();
	const [form, { Form, Field, FieldArray }] = createForm<MyPassportForm>({
		validate: async values => {
			const validate = yupForm(myPassportForm, {
				context: formContext,
				owner,
				debug: $debug.isEnabled(),
			});

			/// @ts-expect-error: type error only between `Maybe<string>` and `undefined`, etc
			const result = await validate(values);

			const steps = new Set(
				Object.keys(result)
					.map(key => key.split(".").at(0))
					.map(key => toStep(key as string)),
			);

			if (steps.size) {
				const firstStepWithError = Math.min(...steps);
				// note: object key order is not guaranteed
				// but should be fine on chrome and safari
				// consequence: since object key order is not guaranteed, two submission attempts
				// with the same set of fields with errors can result in focusing on two different fields
				// each time. or if errors are set in an order, that order is lost
				const focusedFieldWithError = Object.keys(result).at(0);

				$debug(console.debug)(
					`First step with error`,
					firstStepWithError,
				);
				$debug(console.debug)(
					`Focused error field`,
					focusedFieldWithError,
				);

				if (props.stepStatus().currentStep !== firstStepWithError) {
					navigate(
						[location.search, toHash(Math.min(...steps))]
							.filter(Boolean)
							.join(""),
						{
							state: {
								fieldError: focusedFieldWithError,
							},
						},
					);
				}
			}

			return result;
		},
		validateOn: "change",
		revalidateOn: "change",
	});

	// when the form is submitted, if there are any new validation errors in publish mode
	// and the step the error is on is not the current step, then we jump to the earliest step with
	// an error and focus on a field with an error
	// TODO: ideally first field with an error
	// TODO: some fields like select are not so easy to focus because the trigger is a button
	// and the actual input is hidden
	createEffect(() => {
		const state: any = location.state;

		if (!state) {
			return;
		}

		if (!state.fieldError) {
			return;
		}

		// note: running this async is important
		setTimeout(() => {
			window.scrollTo(0, 0);
			focus(form, state.fieldError);
		});
	});

	const qReferenceData = useQuery<DropdownOptions>(() => ({
		queryKey: queryKeys.getReferenceData(authnContext().keycloak?.token),
		queryFn: myPassportFormContext.getReferenceData,
		staleTime: Infinity,
	}));

	const [handle] = createResource(async () => {
		// not ideal that we are performing side effects here
		// but we don't want the page to load until we've set the initial data
		const resetFormValues = (doc: Doc<MyPassportForm>) => {
			$debug(console.debug)("initialValues", doc);

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
			status: MyPassportFormStatus.Draft,
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

		const formValuesFlattened = flattenObject(getValues(form));
		const initialValuesFlattened = flattenObject(
			form.internal.initialValues,
		);

		if (
			!Object.keys(initialValuesFlattened).length &&
			!Object.values(formValuesFlattened).filter(Boolean).length
		) {
			return false;
		}

		return !isEqualWith(
			formValuesFlattened,
			initialValuesFlattened,
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
		mutationFn: myPassportFormContext.putIm42,
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

	const registerNewForm = async () => {
		const automergeUrl = handle()?.url;

		invariant(automergeUrl, "Automerge URL is not defined, check `handle`");

		const uuid = await mRegister.mutateAsync({
			automergeUrl: automergeUrl,
			user: userContext().profile?.uuid,
		});

		await queryClient.refetchQueries({
			queryKey: globalQueryKeys.getPassportApplications(
				authnContext().keycloak?.token,
			),
		});

		return uuid;
	};

	const onSubmit: SubmitHandler<MyPassportForm> = async (
		formValues,
		_event,
	) => {
		if (mSubmit.isPending) {
			return;
		}

		publish();

		const isValid = await validate(form);

		if (!isValid) {
			draft();

			return;
		}

		const user = userContext().profile?.uuid;
		invariant(user, "no user uuid");

		const automergeUrl = handle()?.url;
		invariant(
			automergeUrl,
			"Automerge URL for existing document is not defined, check `handle`",
		);

		if (routeParams.uuid) {
			await mSubmit.mutateAsync({
				uuid: routeParams.uuid as string,
				user,
				automergeUrl,
				formValues,
			});
		} else {
			await mSubmit.mutateAsync({
				uuid: await registerNewForm(),
				user,
				automergeUrl,
				formValues,
			});
		}

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

		$debug(console.debug)("form dirty fields", dirtyFields);

		handle()?.change(doc => {
			Object.entries(dirtyFields).forEach(([path, value]) => {
				$debug(console.debug)("set", path, value);

				set(doc, path, value);
			});
		});
	});

	const isNavigatingBetweenSteps = (event: BeforeLeaveEventArgs) =>
		event.to.toString().includes(event.from.pathname);

	useBeforeLeave(event => {
		if (isOnboarding()) {
			return;
		}

		if (
			event.defaultPrevented ||
			event.from.pathname !== window.location.pathname ||
			show().invalidDataDialog
		) {
			return;
		}

		if (isNavigatingBetweenSteps(event)) {
			return;
		}

		if (!form.invalid) {
			return;
		}

		event.preventDefault();
		toggleInvalidDataDialog();
	});

	useBeforeLeave(event => {
		if (isOnboarding()) {
			return;
		}

		if (
			event.defaultPrevented ||
			event.from.pathname !== window.location.pathname ||
			mDeleteForm.isPending
		) {
			return;
		}

		if (isNavigatingBetweenSteps(event)) {
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
		if (isOnboarding()) {
			return;
		}

		if (
			event.defaultPrevented ||
			event.from.pathname !== window.location.pathname
		) {
			return;
		}

		if (isNavigatingBetweenSteps(event)) {
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
		if (isOnboarding() || mRegister.isSuccess) {
			return;
		}

		if (
			event.defaultPrevented ||
			event.from.pathname !== window.location.pathname ||
			mRegister.isPending
		) {
			return;
		}

		if (isNavigatingBetweenSteps(event)) {
			return;
		}

		const currentUuid = routeParams.uuid;
		const proceed = () => event.retry(true);

		if (!isDirty() || currentUuid) {
			return;
		}

		event.preventDefault();

		registerNewForm().then(proceed);
	});

	// TODO: not tested yet
	// but basically when we are in onboarding mode, disable all route leave handlers
	// and register the form when it is first made dirty
	// TODO: we also don't want to disable onboarding mode until it is submitted
	// and don't want to handle onboarding as a special case on the BE so think just persisting
	// something to local storage is enough
	createEffect(() => {
		if (!isOnboarding()) {
			return;
		}

		if (!isDirty()) {
			return;
		}

		if (mRegister.isSuccess) {
			return;
		}

		registerNewForm();
	});

	const prefillData = () => {
		invariant(import.meta.env.DEV, "Dev funcionality enabled in prod");

		reset(form, {
			/// @ts-expect-error: "type error"
			initialValues: {
				personalDetails: {
					firstName: "Test",
					lastName: "User",
					emailAddress: "test@test.com",
					mobileNumber: "02345689",
					genderCode: "M",
					relationshipStatusCode: "M",
					height: "123",
					dateOfBirth: "01/01/1900",
					countryOfBirthCode: "MY",
					stateOfBirth: "TEST",
				},
				addressDetails: {
					streetAddress: "123 XYZ",
					countryCode: "NZ",
					postcode: "1011",
					state: "TEST",
					city: "TEST",
				},
				applicationDetails: {
					documentType: "Pages64",
					requestType: "First",
					myKadNumber: "930123458890",
					birthDocumentNumber: "WERWEGWER",
				},
				previousDocuments: {
					previousDocumentNumber: "WFWQFQWEFW",
					dependentCaregiverFirstName: "TEST",
					dependentCaregiverLastName: "User",
					dependentCaregiverMyKadNumber: "930123458890",
					dependentCaregiverSignature: "WEGRWER",
				},
				declaration: {
					confirmPreviousDocumentNumber: "WERWEGWER",
					isDetailsCorrect: true,
					isLiable: true,
					declareTrueAndCorrect: true,
				},
			},
		});
	};

	return {
		data: {
			referenceData: () => qReferenceData.data ?? null,
		},
		show,
		toggleDeleteFrictionDialog,
		toggleInvalidDataDialog,
		handle,
		form,
		onSubmit,
		onDelete,
		isMutating: () => form.submitting || mSubmit.isPending,
		isDirty,
		prefillData,
		registerNewForm,
		Components: {
			Form,
			Field: withCustomTransform(Field),
			FieldArray,
		},
	};
};
