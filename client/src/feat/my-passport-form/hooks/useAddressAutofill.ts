import {
	AddressAutofillCore,
	type AddressAutofillRetrieveResponse,
	type AddressAutofillSuggestion,
	type AddressAutofillSuggestionResponse,
} from "@mapbox/search-js-core";
import type { FormStore } from "@modular-forms/solid";
import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { flow } from "es-toolkit";
import type { MyPassportForm } from "feat/my-passport-form/types";

export interface UseAddressAutofillProps {
	form: FormStore<MyPassportForm>;
}

export interface AddressOption {
	streetAddress: string;
	postcode: string;
	city: string;
	state: string;
	country: string;
	countryCode: string;
	suggestion: AddressAutofillSuggestionResponse;
}

export const useAddressAutofill = (props: UseAddressAutofillProps) => {
	const authnContext = useContext(AuthnContext);
	const addressAutofill = new AddressAutofillCore(); // TODO

	const getOptions = async (search: string): Promise<AddressOption[]> => {
		const suggestions = await addressAutofill.suggest(search, {
			sessionToken: authnContext().userId,
		});

		return suggestions.suggestions
			.sort(flow(sortSuggesstions, desc))
			.map(toAddressOption);
	};

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

	const onChangeSuggestion = (
		suggestion: AddressAutofillSuggestionResponse,
	) => {}; // TODO

	return {
		getOptions,
		getSuggestionDetails,
		onChangeSuggestion,
	};
};

const toAddressOption = (
	suggestion: AddressAutofillSuggestion,
): AddressOption => Object.create(null); // TODO

const desc = (sortOrder: number) => -1 * sortOrder;

const sortSuggesstions = (
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

		if (~idx) {
			return 0;
		}

		return idx;
	};

	const accuracyA = getSortOrder(a);
	const accuracyB = getSortOrder(b);

	return accuracyA - accuracyB;
};
