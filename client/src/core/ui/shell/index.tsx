import { useLocale } from "@kobalte/core";
/// @ts-expect-error: export error
import { initParticlesEngine, default as Particles } from "@tsparticles/solid";
import { styles } from "core/constants/styles";
import { UiContext } from "core/context/ui";
import { useContext } from "core/context/utils";
import {
	createEffect,
	createSignal,
	createUniqueId,
	Show,
	type Component,
	type ParentProps,
} from "solid-js";
import { loadFull } from "tsparticles";
import { cn } from "ui/utils";
import { Navbar } from "./navbar";
import { particlesConfig } from "./particles-config";

export const Shell: Component<ParentProps> = props => {
	const { locale, direction } = useLocale();

	return (
		<div lang={locale()} dir={direction()}>
			<Navbar />

			<div class="mt-8">
				<div class={cn(styles.contentContainer)}>
					<div class={cn(styles.narrowContentContainer)}>
						{props.children}
					</div>
				</div>
			</div>

			<ParticlesBackground />
		</div>
	);
};

const ParticlesBackground = () => {
	const [init, setInit] = createSignal(false);
	const uiContext = useContext(UiContext);

	createEffect(previousTheme => {
		const theme = uiContext().theme;

		if (previousTheme === theme && init()) {
			return;
		}

		setInit(false);

		initParticlesEngine((engine: any) => {
			// this loads the tsparticles package bundle, it's the easiest method for getting everything ready
			// starting from v2 you can add only the features you need reducing the bundle size
			return loadFull(engine);
		}).then(() => {
			setInit(true);
		});

		return theme;
	});

	return (
		<Show when={init()}>
			<Particles
				className="absolute"
				id={createUniqueId()}
				options={particlesConfig}
			/>
		</Show>
	);
};
