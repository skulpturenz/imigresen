import { type Component, type ParentProps } from "solid-js";
import { spreadProps } from "./spread-props";

export const withParents =
	(...components: Component<ParentProps>[]) =>
	(Component: Component): Component =>
	(props: ParentProps<any>) => {
		const Merged: Component<ParentProps> = props => {
			const Reduced = components.reduce(
				(Acc, Component) => () => (
					<Component>
						<Acc />
					</Component>
				),
				() => props.children,
			);

			return <Reduced />;
		};

		return (
			<Merged>
				<Component {...spreadProps(props)} />
			</Merged>
		);
	};
