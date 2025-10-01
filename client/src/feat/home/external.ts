import { withParents } from "core/utils";
import { MyPassportFormProvider } from "feat/my-passport-form/context";
import { MyPassportForm as _MyPassportFormWizard } from "feat/my-passport-form/my-passport-form";
import { withI18n as withMyPassportFormWizardI18n } from "feat/my-passport-form/resources";

export const MyPassportFormWizard = withMyPassportFormWizardI18n(
	withParents(MyPassportFormProvider)(_MyPassportFormWizard),
);
