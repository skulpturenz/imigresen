import { Router as SolidRouter } from "@solidjs/router";
import { Router as AuthRouter } from "feat/auth";
import { Router as HomeRouter } from "feat/home";
import { Router as NotFoundRouter } from "feat/not-found";
import { Router as UnauthorizedRouter } from "feat/unauthorized";
import { ErrorBoundary, type Component, type ParentProps } from "solid-js";
import { Portal } from "solid-js/web";

export type RouterProps = Record<string, unknown>;

export const Router = () => {
	return (
		<RouterErrorBoundary>
			<SolidRouter>
				<AuthRouter />
				<HomeRouter />
				<UnauthorizedRouter />
				<NotFoundRouter />
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
