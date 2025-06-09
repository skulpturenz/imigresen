import { MyPassportForm } from "core/constants/my-passport-form-route.enum";
import { useI18n } from "core/context/i18n";
import { generatePath } from "core/utils";
import { SquareArrowOutUpRight } from "lucide-solid";
import {
	createSignal,
	For,
	Show,
	type Component,
	type ParentProps,
} from "solid-js";
import { Button } from "ui/button";
import { Checkbox, CheckboxControl } from "ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "ui/dialog";
import { Typography } from "ui/typography";
import { UUID } from "uuidv7";
import { useMyPassportFormSync } from "./hooks";
import type { resources } from "./resources/i18n/en-US";

export const MyPassportFormSync = () => {
	const [isOpen, setIsOpen] = createSignal(true);
	const toggleIsOpen = () => setIsOpen(isOpen => !isOpen);

	const { data } = useMyPassportFormSync();

	const t = useI18n<typeof resources>();

	return (
		<Show when={data.publicApplications()?.length}>
			<Dialog open={isOpen()} onOpenChange={toggleIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("title")}</DialogTitle>
						<DialogDescription>
							{t("description")}
						</DialogDescription>
					</DialogHeader>

					<form>
						<ol class="flex flex-col space-y-4 my-4">
							<For each={data.publicApplications()}>
								{application => (
									<>
										<PassportApplicationListItem
											uuid={application.uuid}
											automergeUrl={
												application.automergeUrl
											}
										/>
									</>
								)}
							</For>
						</ol>
					</form>

					<DialogFooter>
						<Button variant="ghost" onClick={toggleIsOpen}>
							{t("doCancel")}
						</Button>

						<Button type="submit" onClick={toggleIsOpen}>
							{t("doImport")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Show>
	);
};

export interface PassportApplicationListItemProps {
	uuid: string;
	automergeUrl: string;
}

const PassportApplicationListItem: Component<
	ParentProps<PassportApplicationListItemProps>
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
					{t("listItemDescription", toDate(props.uuid))}
				</Typography>
			</div>

			<div class="flex space-x-4 items-center">
				<Checkbox
					name={props.uuid}
					value={isChecked() ? "on" : "off"}
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

// from: https://gist.github.com/wllmsash/bcb337ce0662ed044012e2d7170f7ed0
const toDate = (uuid: string) => {
	const timestampBytes = new Uint8Array(8);
	timestampBytes.set(
		// first 6 bytes are timestamp
		new Uint8Array(UUID.parse(uuid).bytes.buffer.slice(0, 6)),
		// leave first 2 bytes empty
		// `getBigUint64` reads 8 bytes
		2,
	);

	// unix timestamp
	const timestampMs = new DataView(timestampBytes.buffer).getBigUint64(0);

	return new Date(Number(timestampMs));
};
