import { createQuery } from "@tanstack/solid-query";
import { AuthnContext } from "core/context/authn";
import { useContext } from "core/context/utils";
import { homeService } from "feat/home/services";

export const usePassportApplications = () => {
	const authnContext = useContext(AuthnContext);

	const svc = homeService(authnContext().keycloak?.token as string);

	const passportApplications = createQuery(() => ({
		queryKey: [
			"feat",
			"home",
			"passportApplications",
			authnContext().keycloak?.token,
		],
		queryFn: svc.getPassportApplications,
	}));

	return {
		queries: {
			passportApplications,
		},
	};
};
