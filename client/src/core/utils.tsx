import { splitProps, type Component, type ParentProps } from "solid-js";

export const spreadProps = <T extends Record<any, any>>(props: T) =>
	splitProps(props, []).at(-1) as T;

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
