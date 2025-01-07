import { Router as SolidRouter } from "@solidjs/router";
import { Router as AuthRouter } from "feat/auth";
import { Router as HomeRouter } from "feat/home";
import { Router as NotFoundRouter } from "feat/not-found";
import { Router as UnauthorizedRouter } from "feat/unauthorized";
import { ErrorBoundary, type Component, type ParentProps } from "solid-js";
import { Fallback } from "./fallback";

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

const RouterErrorBoundary: Component<ParentProps> = props => (
	<ErrorBoundary
		fallback={(err, reset) => <Fallback err={err} reset={reset} />}>
		{props.children}
	</ErrorBoundary>
);
