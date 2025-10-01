import { MyPassportForm as _MyPassportFormWizard } from "feat/my-passport-form/my-passport-form";
import { withI18n as withMyPassportFormWizardI18n } from "feat/my-passport-form/resources";
export { MyPassportFormProvider } from "feat/my-passport-form/context";

export const MyPassportFormWizard = withMyPassportFormWizardI18n(
	_MyPassportFormWizard,
);
