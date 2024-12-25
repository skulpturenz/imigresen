import { createQuery } from "@tanstack/solid-query";
import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { HomeContext } from "feat/home/context";

export const usePassportApplications = () => {
	const authnContext = useContext(AuthnContext);
	const homeContext = useContext(HomeContext);

	const passportApplications = createQuery(() => ({
		queryKey: [
			"feat",
			"home",
			"passportApplications",
			authnContext().keycloak?.token,
		],
		queryFn: homeContext.getPassportApplications,
	}));

	return {
		queries: {
			passportApplications,
		},
	};
};
