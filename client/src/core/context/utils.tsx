import { invariant } from "es-toolkit";
import {
	type Component,
	type Context,
	getOwner,
	runWithOwner,
	useContext as useSolidContext,
} from "solid-js";

export const useContext = <T,>(context: Context<T>) => {
	const value = useSolidContext(context);

	invariant(value, "Context not defined");

	return value;
};

interface TrackProps {
	fn?: () => Promise<void>;
}

export const Track: Component<TrackProps> = props => {
	const owner = getOwner();

	// workaround to make error boundaries catch errors which occur async (event handlers, setTimeout)
	// `fn` must be async. if its sync which calls an async function (which throws) then the error
	// will not propagate correctly
	// based on: https://github.com/solidjs/solid/discussions/1174
	props.fn?.().catch(err =>
		runWithOwner(owner, () => {
			throw err;
		}),
	);

	return null;
};
