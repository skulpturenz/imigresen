import { Navigate, useSearchParams } from "@solidjs/router";
import type { Component, ParentProps } from "solid-js";
import { getRedirectPath } from "./utils";

export const LoginCallback: Component<ParentProps> = () => {
	const [searchParams] = useSearchParams<{ redirectPath: string }>();

	return <Navigate href={getRedirectPath(searchParams)} />;
};
