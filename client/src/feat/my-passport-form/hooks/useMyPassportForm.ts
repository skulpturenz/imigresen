import type { DocHandle } from "@automerge/automerge-repo";
import { useParams, useSearchParams } from "@solidjs/router";
// TODO
import { repo } from "core/context/ui/automerge";
import type { MyPassportForm } from "feat/my-passport-form/types";
import { useDocHandle } from "solid-automerge";
import { onCleanup, type Resource } from "solid-js";

export type MaybeResource<T> = Resource<T> | T;

export const useMyPassportForm = () => {
	const routeParams = useParams<{ uuid?: string }>();
	const [searchParams] = useSearchParams<{ automergeUrl?: string }>();

	const getDocHandle = (): MaybeResource<DocHandle<MyPassportForm>> => {
		if (routeParams.uuid && searchParams.automergeUrl) {
			const handle = useDocHandle(undefined, {
				repo,
			}) as Resource<DocHandle<MyPassportForm>>;

			return handle;
		}

		return repo.create<MyPassportForm>({
			hello: "world",
		});
	};
	const handle = getDocHandle();

	onCleanup(() => {
		// TODO: should free memory up by itself when component is unmounted
		// but need to check if `unload` will attempt a sync if network
		// connection is available
		access(handle)?.unload();
	});

	return {
		handle: () => access(handle),
	};
};

const access = <T>(resource: MaybeResource<T>) =>
	typeof resource === "function" ? (resource as Resource<T>)() : resource;
