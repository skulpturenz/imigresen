import { useParams } from "@solidjs/router";
import { useI18n } from "core/context/i18n";
import type { resources } from "feat/my-passport-form/resources/i18n/en-US";
import type { Accessor, Component } from "solid-js";
import { Button } from "ui/button";

export interface FooterProps {
	onClickBack?: (event: MouseEvent) => void;
	onClickNext?: (event: MouseEvent) => void;
	onClickDelete?: (event: MouseEvent) => void;
	isMutating?: Accessor<boolean>;
}

export const MobileFooter: Component<FooterProps> = props => {
	const t = useI18n<typeof resources>();
	const routeParams = useParams<{ uuid?: string }>();

	return (
		<div
			// `isVerySmall`
			class="flex-col sm:hidden space-y-4 mb-4">
			<Button
				variant="secondary"
				class="w-full"
				onClick={props.onClickBack}
				disabled={props.isMutating?.()}>
				{t("doBack")}
			</Button>

			<Button
				variant="default"
				class="w-full"
				onClick={props.onClickNext}
				disabled={props.isMutating?.()}>
				{t("doNext")}
			</Button>

			<Button
				variant="destructive"
				class="w-full"
				onClick={props.onClickDelete}
				disabled={props.isMutating?.() || !routeParams.uuid}>
				{t("doDelete")}
			</Button>
		</div>
	);
};

export const DefaultFooter: Component<FooterProps> = props => {
	const t = useI18n<typeof resources>();
	const routeParams = useParams<{ uuid?: string }>();

	return (
		<div
			// `isSmall` and up
			class="hidden sm:flex justify-between mt-4">
			<div class="flex space-x-2">
				<Button
					variant="destructive"
					onClick={props.onClickDelete}
					disabled={props.isMutating?.() || !routeParams.uuid}>
					{t("doDelete")}
				</Button>
				<Button
					variant="secondary"
					onClick={props.onClickBack}
					disabled={props.isMutating?.()}>
					{t("doBack")}
				</Button>
			</div>

			<Button
				variant="default"
				onClick={props.onClickNext}
				disabled={props.isMutating?.()}>
				{t("doNext")}
			</Button>
		</div>
	);
};
