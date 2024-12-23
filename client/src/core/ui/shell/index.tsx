import { styles } from "core/constants/styles";
import { AuthnContext } from "core/context/authn";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { LogOut, Menu, Settings, User, X } from "lucide-solid";
import { createSignal, Show, type Component, type ParentProps } from "solid-js";
import { Transition } from "solid-transition-group";
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
	mobileMenuSrOnly: "Open main menu",
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
	const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
	const toggleMobileMenu = () =>
		setIsMobileMenuOpen(isMobileMenuOpen => !isMobileMenuOpen);

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
							<div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
								<Button
									size="icon"
									variant="ghost"
									onClick={toggleMobileMenu}>
									<span class="sr-only">
										{resources.mobileMenuSrOnly}
									</span>

									<Show when={!isMobileMenuOpen()}>
										<Menu aria-hidden="true" />
									</Show>

									<Show when={isMobileMenuOpen()}>
										<X aria-hidden="true" />
									</Show>
								</Button>
							</div>

							<div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
								<div class="flex shrink-0 items-center">
									<a
										href="/"
										class="font-bold uppercase text-xl sm:text-3xl">
										{resources.logoAlt}
									</a>
								</div>
							</div>

							<div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
								<Show
									when={
										!authContext().keycloak?.authenticated
									}>
									<div class="hidden sm:flex gap-4">
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
									</div>
								</Show>

								<Show
									when={
										authContext().keycloak?.authenticated
									}>
									<DropdownMenu placement="bottom">
										<DropdownMenuTrigger>
											<Avatar class="size-8 sm:size-10">
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
													{resources.avatar.doLogout}
												</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</Show>
							</div>
						</div>
					</div>
				</div>
			</nav>

			<Transition
				enterActiveClass="animate-in fade-in-0 zoom-in-95"
				exitActiveClass="animate-out fade-out-0 zoom-out-95">
				<Show when={isMobileMenuOpen()}>
					<div class="bg-secondary transition-shadow">
						<div class="flex flex-col gap-4">
							<Button
								variant="ghost"
								onClick={authContext().actions.login}>
								{resources.doLogin}
							</Button>

							<Button
								variant="ghost"
								onClick={authContext().actions.register}>
								{resources.doRegister}
							</Button>
						</div>
					</div>
				</Show>
			</Transition>
		</>
	);
};
