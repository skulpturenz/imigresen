import {
	randAvatar,
	randEmail,
	randFirstName,
	randLastName,
	randPhoneNumber,
	randUuid,
} from "@ngneat/falso";
import { createUserContext } from "core/context/initializers";
import { memoize } from "es-toolkit";
import {
	mergeProps,
	onMount,
	Show,
	type Accessor,
	type Component,
	type ParentProps,
} from "solid-js";
import { UserContext } from "./provider";
import type { UserSvc } from "./store";

export interface UserProviderMockProps {
	svc?: Accessor<UserSvc>;
}

export const UserProviderMock: Component<
	ParentProps<UserProviderMockProps>
> = props => {
	const withDefaultProps = mergeProps(
		{
			svc: memoize(() => ({
				...createUserContext(),
				isInitialLoading: false,
				profile: {
					uuid: randUuid(),
					firstName: randFirstName(),
					lastName: randLastName(),
					email: randEmail(),
					avatar: randAvatar(),
					phoneNumber: randPhoneNumber(),
				},
			})),
		},
		props,
	);

	onMount(() => {
		withDefaultProps.svc().actions.init();
	});

	return (
		<UserContext.Provider value={withDefaultProps.svc}>
			<Show when={!withDefaultProps.svc().isInitialLoading}>
				{withDefaultProps.children}
			</Show>
		</UserContext.Provider>
	);
};
