import { useParams, useSearchParams } from "@solidjs/router";
import { AuthnContext } from "core/context/authn";
import { myPassportFormAutomergeRepoMock } from "feat/my-passport-form/services/my-passport-form-service-mock";
import type { MyPassportForm } from "feat/my-passport-form/types";
import { useDocHandle } from "solid-automerge";
import { createResource, useContext } from "solid-js";

export const useMyPassportForm = () => {
	// TODO
	const authnContext = useContext(AuthnContext);
	const automergeRepo = myPassportFormAutomergeRepoMock(
		authnContext().keycloak?.token,
	);

	const routeParams = useParams<{ uuid?: string }>();
	const [searchParams] = useSearchParams<{ automergeUrl?: string }>();

	const getDocHandle = () => {
		if (routeParams.uuid && searchParams.automergeUrl) {
			return useDocHandle(undefined, {
				repo: automergeRepo,
			});
		}

		// TODO: ideally don't do this
		const [handle] = createResource("", () =>
			automergeRepo.create<MyPassportForm>({
				hello: "world",
			}),
		);

		return handle;
	};

	return {
		handle: getDocHandle(),
	};
};
