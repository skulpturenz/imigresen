import {
	AddressAutofillCore,
	type AddressAutofillRetrieveResponse,
	type AddressAutofillSuggestion,
} from "@mapbox/search-js-core";
import { setValue, setValues, type FormStore } from "@modular-forms/solid";
import { useQueryClient } from "@tanstack/solid-query";
import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { get, localeAsc, multiSort } from "core/data/sort";
import { differenceInMinutes } from "date-fns";
import { debounce, invariant } from "es-toolkit";
import { queryKeys } from "feat/my-passport-form/resources/query-keys";
import type { MyPassportForm } from "feat/my-passport-form/types";
import { createSignal, onCleanup } from "solid-js";

export interface UseAddressAutofillProps {
	form: FormStore<MyPassportForm>;
}

export interface AddressOption {
	value: string;
	label: string;
	meta: {
		streetAddress?: string;
		postcode?: string;
		city?: string;
		state?: string;
		country?: string;
		countryCode?: string;
		suggestion: AddressAutofillSuggestion;
	};
}

export const useAddressAutofill = (props: UseAddressAutofillProps) => {
	const START_DATE = new Date();

	const authnContext = useContext(AuthnContext);

	const queryClient = useQueryClient();

	const [autofillOptions, setAutofillOptions] = createSignal<AddressOption[]>(
		[],
	);

	const DEBOUNCE_TIME_MS = 250;

	const getOptions = async (search: string) => {
		const _getOptions = async (search: string) => {
			const CURRENT_DATE = new Date();
			const MAX_MINUTES = 2;

			const minutesElapsed = differenceInMinutes(
				CURRENT_DATE,
				START_DATE,
			);

			if (!import.meta.env.PROD) {
				console.debug("minutes elapsed", minutesElapsed);
			}

			if (!import.meta.env.DEV && minutesElapsed >= MAX_MINUTES) {
				return [];
			}

			if (!search) {
				return [];
			}

			invariant(authnContext().mapboxToken, "Mapbox token not specified");
			const addressAutofill = new AddressAutofillCore({
				accessToken: authnContext().mapboxToken,
			});
			const { suggestions } = await addressAutofill.suggest(search, {
				sessionToken: authnContext().userId,
			});

			const getStreetAddress = (suggestion: AddressAutofillSuggestion) =>
				suggestion.address ?? "";

			const sortByAccuracyDescNameAsc = multiSort(
				sortAccuracyDesc,
				get(getStreetAddress)(localeAsc),
			);

			return suggestions
				.sort(sortByAccuracyDescNameAsc)
				.map(toAddressOption);
		};

		const data = await queryClient.fetchQuery({
			queryKey: queryKeys.getAddressAutofill(
				search,
				authnContext().userId,
			),
			queryFn: () => _getOptions(search),
			staleTime: Infinity,
		});

		setAutofillOptions(data);

		return data;
	};

	const debouncedGetOptions = debounce(getOptions, DEBOUNCE_TIME_MS);

	onCleanup(() => {
		debouncedGetOptions.cancel();
	});

	const getSuggestionDetails = async (
		suggestion: AddressAutofillSuggestion,
	): Promise<AddressAutofillRetrieveResponse | null> => {
		invariant(authnContext().mapboxToken, "Mapbox token not specified");
		const addressAutofill = new AddressAutofillCore({
			accessToken: authnContext().mapboxToken,
		});

		if (!addressAutofill.canRetrieve(suggestion)) {
			return null;
		}

		return addressAutofill.retrieve(suggestion, {
			sessionToken: authnContext().userId,
		});
	};

	const onChangeOption = (mapboxId?: string) => {
		if (!mapboxId) {
			return;
		}

		const option = autofillOptions().find(
			option => option.value === mapboxId,
		);
		invariant(
			option,
			`Address autofill option with id ${mapboxId} not found`,
		);

		setValue(
			props.form,
			"addressDetails.streetAddress",
			option.meta.streetAddress ?? "",
			{
				shouldDirty: true,
				shouldValidate: true,
			},
		);

		setValues(
			props.form,
			{
				addressDetails: {
					postcode: option.meta.postcode,
					// TODO: we are referring to countries by names at the moment
					countryCode: option.meta.country,
					state: option.meta.state,
					city: option.meta.city,
				},
			},
			{ shouldDirty: true, shouldValidate: true },
		);
	};

	const onClear = () => {
		setValues(
			props.form,
			{
				addressDetails: {
					postcode: "",
					streetAddress: "",
					countryCode: "",
					state: "",
					city: "",
				},
			},
			{ shouldDirty: false, shouldValidate: false },
		);
	};

	return {
		getOptions: debouncedGetOptions,
		autofillOptions,
		getSuggestionDetails,
		onChangeOption,
		onClear,
	};
};

const toAddressOption = (
	suggestion: AddressAutofillSuggestion,
): AddressOption => ({
	value: suggestion.mapbox_id,
	label: suggestion.address_line1 ?? "",
	meta: {
		streetAddress: suggestion.address_line1,
		postcode: suggestion.postcode,
		country: suggestion.country,
		countryCode: suggestion.country_code?.toUpperCase(),
		state: suggestion.address_level1,
		city: suggestion.address_level2,
		suggestion,
	},
});

const sortAccuracyDesc = (
	a: AddressAutofillSuggestion,
	b: AddressAutofillSuggestion,
) => {
	const accuracies = [
		"point",
		"parcel",
		"street",
		"intersection",
		"rooftop",
		"interpolated",
	];

	const getSortOrder = (x: AddressAutofillSuggestion) => {
		const idx = accuracies.findIndex(accuracy => x.accuracy === accuracy);

		if (!~idx) {
			return 0;
		}

		return idx;
	};

	const accuracyA = getSortOrder(a);
	const accuracyB = getSortOrder(b);

	return accuracyA - accuracyB;
};

export const formatOption = (option?: AddressOption) =>
	[
		option?.meta.streetAddress,
		option?.meta.city,
		[option?.meta.postcode, option?.meta.state].filter(Boolean).join(" "),
		option?.meta.country,
	]
		.filter(Boolean)
		.join(", ");
