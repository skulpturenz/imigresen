import { useQuery } from "@tanstack/solid-query";
import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { HomeContext } from "feat/home/context";

export const usePassportApplications = () => {
	const authnContext = useContext(AuthnContext);
	const homeContext = useContext(HomeContext);

	const passportApplications = useQuery(() => ({
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
