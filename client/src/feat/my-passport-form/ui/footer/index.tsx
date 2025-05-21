import { useI18n } from "core/context/i18n";
import type { resources } from "feat/my-passport-form/resources/i18n/en-US";
import type { Component } from "solid-js";
import { Button } from "ui/button";

export interface FooterProps {
	onClickBack?: (event: MouseEvent) => void;
	onClickNext?: (event: MouseEvent) => void;
	onClickDelete?: (event: MouseEvent) => void;
}

export const MobileFooter: Component<FooterProps> = props => {
	const t = useI18n<typeof resources>();

	return (
		<div
			// `isVerySmall`
			class="flex-col sm:hidden space-y-4 mb-4">
			<Button
				variant="secondary"
				class="w-full"
				onClick={props.onClickBack}>
				{t("doBack")}
			</Button>

			<Button
				variant="default"
				class="w-full"
				onClick={props.onClickNext}>
				{t("doNext")}
			</Button>

			<Button
				variant="destructive"
				class="w-full"
				onClick={props.onClickDelete}>
				{t("doDelete")}
			</Button>
		</div>
	);
};

export const DefaultFooter: Component<FooterProps> = props => {
	const t = useI18n<typeof resources>();

	return (
		<div
			// `isSmall` and up
			class="hidden sm:flex justify-between mt-4">
			<div class="flex space-x-2">
				<Button variant="destructive" onClick={props.onClickDelete}>
					{t("doDelete")}
				</Button>
				<Button variant="secondary" onClick={props.onClickBack}>
					{t("doBack")}
				</Button>
			</div>

			<Button variant="default" onClick={props.onClickNext}>
				{t("doNext")}
			</Button>
		</div>
	);
};
