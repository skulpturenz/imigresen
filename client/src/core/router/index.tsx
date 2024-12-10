import {
	Route as SolidRoute,
	Router as SolidRouter,
	type RouteSectionProps,
} from "@solidjs/router";
import { Router as AuthRouter } from "feat/auth";
import { Router as HomeRouter } from "feat/home";
import { ErrorBoundary, type Component, type ParentProps } from "solid-js";
import { Portal } from "solid-js/web";

export type RouterProps = Record<string, unknown>;

export const Router = () => {
	return (
		<RouterErrorBoundary>
			<SolidRouter>
				<AuthRouter />
				<HomeRouter />
				<SolidRoute path="*path" component={NotFound} />
			</SolidRouter>
		</RouterErrorBoundary>
	);
};

// TODO: improve
const RouterErrorBoundary: Component<ParentProps> = props => (
	<ErrorBoundary
		fallback={(err, reset) => (
			<Portal>
				<div onClick={reset}>Error: {err.toString()}</div>
			</Portal>
		)}>
		{props.children}
	</ErrorBoundary>
);

// TODO: improve
const NotFound: Component<RouteSectionProps> = _props => (
	<span>Not found!!!</span>
);
