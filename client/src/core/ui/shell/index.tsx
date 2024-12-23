import { styles } from "core/constants/styles";
import { AuthnContext } from "core/context/authn";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { LogOut, Settings, User } from "lucide-solid";
import type { Component, ParentProps } from "solid-js";
import { Avatar, AvatarFallback, AvatarImage } from "ui/avatar";
import { Button } from "ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuGroupLabel,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "ui/dropdown-menu";
import { cn } from "ui/utils";

const resources = {
	logoAlt: "Imigresen",
	doLogin: "Login",
	doRegister: "Register",
	avatar: {
		accountGroupLabel: "My Account",
		doProfile: "Profile",
		doSettings: "Settings",
		doLogout: "Logout",
	},
};

export const Shell: Component<ParentProps> = props => (
	<>
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

export const Navbar: Component<ParentProps> = () => {
	const authContext = useContext(AuthnContext);
	const _userContext = useContext(UserContext);

	// TODO
	const toInitials = (_name: string) => "CN";

	return (
		<>
			<nav class="bg-background">
				<div class={cn(styles.contentContainer)}>
					<div class={cn(styles.narrowContentContainer)}>
						<div class="relative flex h-16 items-center justify-between">
							<div>
								<a
									href="/"
									class="font-bold uppercase text-3xl">
									{resources.logoAlt}
								</a>
							</div>

							<div class="flex gap-4">
								{!authContext().keycloak?.authenticated && (
									<>
										<Button
											variant="secondary"
											onClick={
												authContext().actions.login
											}>
											{resources.doLogin}
										</Button>

										<Button
											onClick={
												authContext().actions.register
											}>
											{resources.doRegister}
										</Button>
									</>
								)}

								{authContext().keycloak?.authenticated && (
									<>
										<DropdownMenu placement="bottom">
											<DropdownMenuTrigger>
												<Avatar>
													<AvatarImage
														// TODO
														src="https://github.com/shadcn.png"
														alt="@shadcn"
													/>
													<AvatarFallback>
														{toInitials("CN")}
													</AvatarFallback>
												</Avatar>
											</DropdownMenuTrigger>

											<DropdownMenuContent class="mt-4 w-56">
												<DropdownMenuGroup>
													<DropdownMenuGroupLabel>
														{
															resources.avatar
																.accountGroupLabel
														}
													</DropdownMenuGroupLabel>
													<DropdownMenuSeparator />
													<DropdownMenuItem class="flex gap-2">
														<User />
														<span>
															{
																resources.avatar
																	.doProfile
															}
														</span>
													</DropdownMenuItem>
													<DropdownMenuItem class="flex gap-2">
														<Settings />
														<span>
															{
																resources.avatar
																	.doSettings
															}
														</span>
													</DropdownMenuItem>
												</DropdownMenuGroup>
												<DropdownMenuSeparator />
												<DropdownMenuItem class="flex gap-2">
													<LogOut />
													<span>
														{
															resources.avatar
																.doLogout
														}
													</span>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</nav>
		</>
	);
};
