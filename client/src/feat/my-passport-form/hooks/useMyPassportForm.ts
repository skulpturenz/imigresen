import { AuthnContext } from "core/context/authn";
import { myPassportFormAutomergeRepoMock } from "feat/my-passport-form/services/my-passport-form-service-mock";
import { useDocHandle } from "solid-automerge";
import { useContext } from "solid-js";

export const useMyPassportForm = () => {
	const authnContext = useContext(AuthnContext);

	const automergeRepo = myPassportFormAutomergeRepoMock(
		authnContext().keycloak?.token,
	);

	const handle = useDocHandle(undefined, {
		repo: automergeRepo,
	});

	return {
		handle,
	};
};
