import { withParents } from "core/utils";
import { lazy } from "solid-js";

export const MyPassportFormWizard = lazy(async () => {
	const { MyPassportFormProvider } = await import(
		"feat/my-passport-form/context"
	);
	const { withI18n } = await import("feat/my-passport-form/resources");

	return import("feat/my-passport-form/my-passport-form").then(exports => ({
		default: withI18n(
			withParents(MyPassportFormProvider)(exports.MyPassportForm),
		),
	}));
});
