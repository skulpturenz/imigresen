import {
	AddressAutofillCore,
	type AddressAutofillRetrieveResponse,
	type AddressAutofillSuggestion,
} from "@mapbox/search-js-core";
import { setValue, setValues, type FormStore } from "@modular-forms/solid";
import { useQueryClient } from "@tanstack/solid-query";
import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { debounce, invariant } from "es-toolkit";
import { queryKeys } from "feat/my-passport-form/resources/query-keys";
import type { MyPassportForm } from "feat/my-passport-form/types";
import { get, localeAsc, multiSort } from "feat/my-passport-form/utils/sort";
import { createSignal, onCleanup } from "solid-js";

invariant(
	import.meta.env.VITE_MAPBOX_TOKEN,
	"Mapbox public token not specified",
);

export interface UseAddressAutofillProps {
	form: FormStore<MyPassportForm>;
}

export interface AddressOption {
	streetAddress?: string;
	postcode?: string;
	city?: string;
	state?: string;
	country?: string;
	countryCode?: string;
	suggestion: AddressAutofillSuggestion;
}

export const useAddressAutofill = (props: UseAddressAutofillProps) => {
	const authnContext = useContext(AuthnContext);
	const addressAutofill = new AddressAutofillCore({
		accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
	});
	const queryClient = useQueryClient();

	const [autofillOptions, setAutofillOptions] = createSignal<AddressOption[]>(
		[],
	);

	const DEBOUNCE_TIME_MS = 250;

	const getOptions = async (search: string) => {
		const _getOptions = async (search: string) => {
			if (!search) {
				return [];
			}

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
		if (!addressAutofill.canRetrieve(suggestion)) {
			return null;
		}

		return addressAutofill.retrieve(suggestion, {
			sessionToken: authnContext().userId,
		});
	};

	const onChangeOption = (option: AddressOption | null) => {
		if (!option) {
			return;
		}

		setValue(
			props.form,
			"addressDetails.streetAddress",
			option.streetAddress ?? "",
			{
				shouldDirty: true,
				shouldValidate: true,
			},
		);

		setValues(
			props.form,
			{
				addressDetails: {
					postcode: option.postcode,
					// TODO: we are referring to countries by names at the moment
					countryCode: option.countryCode,
					state: option.state,
					city: option.city,
				},
			},
			{ shouldDirty: false, shouldValidate: true },
		);
	};

	return {
		getOptions: debouncedGetOptions,
		autofillOptions,
		getSuggestionDetails,
		onChangeOption,
	};
};

const toAddressOption = (
	suggestion: AddressAutofillSuggestion,
): AddressOption => ({
	streetAddress: suggestion.address_line1,
	postcode: suggestion.postcode,
	country: suggestion.country,
	countryCode: suggestion.country_code?.toUpperCase(),
	state: suggestion.address_level1,
	city: suggestion.address_level2,
	suggestion,
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
		option?.streetAddress,
		option?.city,
		[option?.postcode, option?.state].filter(Boolean).join(" "),
		option?.country,
	]
		.filter(Boolean)
		.join(", ");
