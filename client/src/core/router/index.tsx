import { Router as SolidRouter } from "@solidjs/router";
import { Router as HomeRouter } from "feat/home";
import { ErrorBoundary, type Component, type ParentProps } from "solid-js";

export type RouterProps = Record<string, unknown>;

export const Router = () => {
	return (
		<RouterErrorBoundary>
			<SolidRouter>
				<HomeRouter />
			</SolidRouter>
		</RouterErrorBoundary>
	);
};

// TODO: improve
const RouterErrorBoundary: Component<ParentProps> = props => (
	<ErrorBoundary
		fallback={(err, reset) => (
			<div onClick={reset}>Error: {err.toString()}</div>
		)}>
		{props.children}
	</ErrorBoundary>
);
