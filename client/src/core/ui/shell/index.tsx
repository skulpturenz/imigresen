import { useLocale } from "@kobalte/core";
import { styles } from "core/constants/styles";
import { type Component, type ParentProps } from "solid-js";
import { cn } from "ui/utils";
import { Navbar } from "./navbar";

export const Shell: Component<ParentProps> = props => {
	const { locale, direction } = useLocale();

	return (
		<div lang={locale()} dir={direction()}>
			<Navbar />

			<div class="my-14 md:my-20">
				<div class={cn(styles.contentContainer)}>
					<div class={cn(styles.narrowContentContainer)}>
						{props.children}
					</div>
				</div>
			</div>
		</div>
	);
};
