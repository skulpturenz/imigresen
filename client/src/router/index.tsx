import { Route, Router as SolidRouter } from "@solidjs/router";
import { Home } from "feat/home";

export const Router = () => (
	<SolidRouter>
		<Route path="/" component={Home} />
	</SolidRouter>
);
