import { useParams, useSearchParams } from "@solidjs/router";
import { AuthnContext } from "core/context/authn";
import { myPassportFormAutomergeRepoMock } from "feat/my-passport-form/services/my-passport-form-service-mock";
import type { MyPassportForm } from "feat/my-passport-form/types";
import { useDocHandle } from "solid-automerge";
import { createResource, onCleanup, useContext } from "solid-js";

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
	const handle = getDocHandle();

	onCleanup(() => {
		// TODO: should free memory up by itself when component is unmounted
		// but need to check if `unload` will attempt a sync if network
		// connection is available
		handle()?.unload();
	});

	return {
		handle,
	};
};
