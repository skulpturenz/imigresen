import { styles } from "core/constants/styles";
import { type Component, type ParentProps } from "solid-js";
import { cn } from "ui/utils";
import { Navbar } from "./navbar";

export const Shell: Component<ParentProps> = props => (
	<>
		<Navbar />

		<div class="mt-8">
			<div class={cn(styles.contentContainer)}>
				<div class={cn(styles.narrowContentContainer)}>
					{props.children}
				</div>
			</div>
		</div>
	</>
);
