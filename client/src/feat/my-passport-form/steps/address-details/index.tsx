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

export const AddressDetails = () => {
	return (
		<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
			<div class="col-span-full">
				<TextFieldRoot>
					<TextFieldLabel>Street address</TextFieldLabel>
					<TextField type="email" placeholder="Email" />
					<TextFieldDescription>
						Enter a valid email
					</TextFieldDescription>
					<TextFieldErrorMessage>
						Email is required.
					</TextFieldErrorMessage>
				</TextFieldRoot>
			</div>

			<div>
				<TextFieldRoot>
					<TextFieldLabel>City</TextFieldLabel>
					<TextField type="email" placeholder="Email" />
					<TextFieldDescription>
						Enter a valid email
					</TextFieldDescription>
					<TextFieldErrorMessage>
						Email is required.
					</TextFieldErrorMessage>
				</TextFieldRoot>
			</div>

			<div>
				<TextFieldRoot>
					<TextFieldLabel>State</TextFieldLabel>
					<TextField type="email" placeholder="Email" />
					<TextFieldDescription>
						Enter a valid email
					</TextFieldDescription>
					<TextFieldErrorMessage>
						Email is required.
					</TextFieldErrorMessage>
				</TextFieldRoot>
			</div>

			<div>
				<TextFieldRoot>
					<TextFieldLabel>Postcode</TextFieldLabel>
					<TextField type="email" placeholder="Email" />
					<TextFieldDescription>
						Enter a valid email
					</TextFieldDescription>
					<TextFieldErrorMessage>
						Email is required.
					</TextFieldErrorMessage>
				</TextFieldRoot>
			</div>

			<div>
				<Label>Country</Label>
				<Select
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
		</div>
	);
};
