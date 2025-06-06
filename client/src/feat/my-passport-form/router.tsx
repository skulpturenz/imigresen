import { MyPassportForm } from "core/constants/my-passport-form-route.enum";
import { useI18n } from "core/context/i18n";
import type { RouterProps } from "core/router";
import { addRoutes, toPath, type RouteProps } from "core/router/route";
import { withParents } from "core/utils/utils";
import { lazy, type Component } from "solid-js";
import { withI18n } from "./resources";
import type { resources } from "./resources/i18n/en-US";

export const Router: Component<RouterProps> = withI18n(_props => {
	const t = useI18n<typeof resources>();

	const routes = [
		{
			path: toPath(MyPassportForm.New),
			title: t("metaTitle"),
			component: lazy(async () => {
				const { MyPassportFormProviderMock } = await import(
					"./context"
				);

				return import("./my-passport-form").then(exports => ({
					default: withI18n(
						withParents(MyPassportFormProviderMock)(
							exports.MyPassportForm,
						),
					),
				}));
			}),
			isHidden: true,
		},
		{
			path: toPath(MyPassportForm.Edit),
			title: t("metaTitle"),
			component: lazy(async () => {
				const { MyPassportFormProviderMock } = await import(
					"./context"
				);

				return import("./my-passport-form").then(exports => ({
					default: withI18n(
						withParents(MyPassportFormProviderMock)(
							exports.MyPassportForm,
						),
					),
				}));
			}),
			isHidden: true,
		},
	] as RouteProps[];

	return addRoutes(...routes);
});
