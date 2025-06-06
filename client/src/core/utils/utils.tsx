import { invariant, isNil } from "es-toolkit";
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

export const generatePath = (path: string, routeParams: Record<string, any>) =>
	Object.entries(routeParams).reduce((path, [searchValue, replaceValue]) => {
		invariant(
			!isNil(replaceValue) && replaceValue?.toString(),
			`Route parameter for ${searchValue} is not defined`,
		);

		return path.replace(`:${searchValue}`, replaceValue.toString());
	}, path);
