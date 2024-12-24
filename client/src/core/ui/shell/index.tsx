/// @ts-expect-error: export error
import { initParticlesEngine, default as Particles } from "@tsparticles/solid";
import { styles } from "core/constants/styles";
import {
	createSignal,
	createUniqueId,
	onMount,
	Show,
	type Component,
	type ParentProps,
} from "solid-js";
import { loadFull } from "tsparticles";
import { cn } from "ui/utils";
import { Navbar } from "./navbar";
import { particlesConfig } from "./particles-config";

export const Shell: Component<ParentProps> = props => {
	return (
		<>
			<div class="absolute">
				<ParticlesBackground />
			</div>

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
};

const ParticlesBackground = () => {
	const [init, setInit] = createSignal(false);

	onMount(() => {
		if (init()) {
			return;
		}

		initParticlesEngine((engine: any) => {
			// this loads the tsparticles package bundle, it's the easiest method for getting everything ready
			// starting from v2 you can add only the features you need reducing the bundle size
			return loadFull(engine);
		}).then(() => {
			setInit(true);
		});
	});

	return (
		<Show when={init()}>
			<Particles id={createUniqueId()} options={particlesConfig} />
		</Show>
	);
};
