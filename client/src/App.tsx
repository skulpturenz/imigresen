import { Providers } from "./core/context";
import { Router } from "./core/router";

export const App = () => {
	return (
		<Providers>
			<Router />
		</Providers>
	);
};
