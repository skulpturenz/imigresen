import { MyPassportForm } from "core/constants/my-passport-form-route.enum";
import { useI18n } from "core/context/i18n";
import { generatePath } from "core/utils";
import { uuidToDate } from "core/utils/uuid-to-date";
import type { resources } from "feat/my-passport-form-sync/resources/i18n/en-us";
import { SquareArrowOutUpRight } from "lucide-solid";
import { createSignal, type Component, type ParentProps } from "solid-js";
import { Button } from "ui/button";
import { Checkbox, CheckboxControl } from "ui/checkbox";
import { Typography } from "ui/typography";
import { UUID } from "uuidv7";

export interface PassportApplicationLiProps {
	uuid: string;
	automergeUrl: string;
}

export const PassportApplicationLi: Component<
	ParentProps<PassportApplicationLiProps>
> = props => {
	const t = useI18n<typeof resources>();

	const [isChecked, setIsChecked] = createSignal(false);

	const getHref = () => {
		const url = new URL(location.origin);
		url.hash = location.hash;

		const searchParams = new URLSearchParams({
			automergeUrl: props.automergeUrl,
			view: "sync",
		});

		url.pathname = generatePath(MyPassportForm.Edit, {
			uuid: props.uuid,
		});
		url.search = searchParams.toString();

		return url.href;
	};

	return (
		<li class="flex items-center justify-between p-4">
			<div class="flex space-x-2 items-center">
				<Typography>
					{t(
						"listItemDescription",
						uuidToDate(UUID.parse(props.uuid)),
					)}
				</Typography>
			</div>

			<div class="flex space-x-4 items-center">
				<Checkbox
					name={props.uuid}
					value={props.automergeUrl}
					checked={isChecked()}
					onChange={setIsChecked}>
					<CheckboxControl />
				</Checkbox>

				<a
					href={getHref()}
					target="_blank"
					rel="noopener noreferrer"
					class="focus:outline-none focus-visible:outline-none"
					tabIndex={-1}>
					<Button tabIndex={0} variant="secondary" size="icon">
						<SquareArrowOutUpRight />
					</Button>
				</a>
			</div>
		</li>
	);
};
