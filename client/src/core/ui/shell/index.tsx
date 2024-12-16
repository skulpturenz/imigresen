import type { Component, ParentProps } from "solid-js";

export const Shell: Component<ParentProps> = props => <>{props.children}</>;

export const Navbar: Component<ParentProps> = props => <>{props.children}</>;
