import { Router as SolidRouter } from "@solidjs/router";
import { Router as HomeRouter } from "feat/home";

export type RouterProps = Record<string, unknown>;

export const Router = () => {
	return (
		<SolidRouter>
			<HomeRouter />
		</SolidRouter>
	);
};
