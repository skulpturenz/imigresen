import { ProvidersMock as Providers } from "core/context/provider-mock";
// import { Providers } from "core/context";
import { Router } from "core/router";
import { ErrorBoundary, type Component, type ParentProps } from "solid-js";
import { Fallback } from "./fallback";

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
		fallback={(err, reset) => <Fallback err={err} reset={reset} />}>
		{props.children}
	</ErrorBoundary>
);
