import { splitProps, type Component, type ParentProps } from "solid-js";

export const spreadProps = <T extends Record<any, any>>(props: T) =>
	splitProps(props, []).at(-1) as T;

export const withComponents =
	(...components: Component<ParentProps>[]) =>
	(Component: Component) => {
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
				<Component />
			</Merged>
		);
	};
