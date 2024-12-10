import { ErrorBoundary, type Component, type ParentProps } from "solid-js";
import { Portal } from "solid-js/web";
import { Providers } from "./core/context";
import { Router } from "./core/router";

export const App = () => {
	return (
		<AppErrorBoundary>
			<Providers>
				<Router />
			</Providers>
		</AppErrorBoundary>
	);
};

const AppErrorBoundary: Component<ParentProps> = props => (
	<ErrorBoundary
		fallback={(err, reset) => (
			<Portal>
				<div onClick={reset}>Error: {err.toString()}</div>
			</Portal>
		)}>
		{props.children}
	</ErrorBoundary>
);
