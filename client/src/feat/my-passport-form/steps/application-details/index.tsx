import { useI18n } from "core/context/i18n";
import type { resources } from "feat/my-passport-form/resources/i18n/en-US";
import { Label } from "ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "ui/select";
import {
	TextField,
	TextFieldDescription,
	TextFieldErrorMessage,
	TextFieldLabel,
	TextFieldRoot,
} from "ui/text-field";

export const ApplicationDetails = () => {
	const t = useI18n<typeof resources>();

	return (
		<>
			<div>
				<Label>{t("form.documentType.label")}</Label>

				<Select
					class="mt-4"
					options={[
						"Apple",
						"Banana",
						"Blueberry",
						"Grapes",
						"Pineapple",
					]}
					placeholder={t("form.documentType.placeholder")}
					itemComponent={props => (
						<SelectItem item={props.item}>
							{props.item.rawValue}
						</SelectItem>
					)}>
					<SelectTrigger>
						<SelectValue<string>>
							{state => state.selectedOption()}
						</SelectValue>
					</SelectTrigger>
					<SelectContent />
				</Select>
			</div>

			<div class="space-y-2">
				<Label>Request type</Label>
				<Select
					class="mt-4"
					options={[
						"Apple",
						"Banana",
						"Blueberry",
						"Grapes",
						"Pineapple",
					]}
					placeholder="Select a fruit…"
					itemComponent={props => (
						<SelectItem item={props.item}>
							{props.item.rawValue}
						</SelectItem>
					)}>
					<SelectTrigger>
						<SelectValue<string>>
							{state => state.selectedOption()}
						</SelectValue>
					</SelectTrigger>
					<SelectContent />
				</Select>
			</div>

			<div class="col-span-full">
				<TextFieldRoot>
					<TextFieldLabel>Identity card number</TextFieldLabel>
					<TextField type="email" placeholder="Email" />
					<TextFieldDescription>
						Enter a valid email
					</TextFieldDescription>
					<TextFieldErrorMessage>
						Email is required.
					</TextFieldErrorMessage>
				</TextFieldRoot>
			</div>

			<div class="col-span-full">
				<TextFieldRoot>
					<TextFieldLabel>Birth certificate number</TextFieldLabel>
					<TextField type="email" placeholder="Email" />
					<TextFieldDescription>
						Enter a valid email
					</TextFieldDescription>
					<TextFieldErrorMessage>
						Email is required.
					</TextFieldErrorMessage>
				</TextFieldRoot>
			</div>
		</>
	);
};
