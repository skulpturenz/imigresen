import { withParents } from "core/utils";
import { lazy } from "solid-js";
import { withI18n } from "./resources";

export const MyPassportFormSyncLazy = lazy(async () => {
	return import("./my-passport-form-sync").then(async exports => {
		const { MyPassportFormSyncProviderMock } = await import("./context");

		return {
			default: withI18n(
				withParents(MyPassportFormSyncProviderMock)(
					exports.MyPassportFormSync,
				),
			),
		};
	});
});
