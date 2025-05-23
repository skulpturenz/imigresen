import type { DocHandle } from "@automerge/automerge-repo";
import { useParams, useSearchParams } from "@solidjs/router";
import type { MyPassportForm } from "feat/my-passport-form/types";
import { useDocHandle, useRepo } from "solid-automerge";
import { type Resource } from "solid-js";

export type MaybeResource<T> = Resource<T> | T;

export const useMyPassportForm = () => {
	const repo = useRepo();

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

	return {
		handle: () => access(handle),
	};
};

const access = <T>(resource: MaybeResource<T>) =>
	typeof resource === "function" ? (resource as Resource<T>)() : resource;
