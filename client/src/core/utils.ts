import { splitProps } from "solid-js";

export const spreadProps = <T extends Record<any, any>>(props: T) =>
	splitProps(props, []).at(-1) as T;
