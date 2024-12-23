import { styles } from "core/constants/styles";
import { AuthnContext } from "core/context/authn";
import { UiContext } from "core/context/ui";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { LogOut, Menu, Moon, Settings, Sun, User, X } from "lucide-solid";
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
	doLogin: "Login",
	doRegister: "Register",
	doSwitchTheme: (nextTheme: "light" | "dark") =>
		`Switch to ${nextTheme} mode`,
	avatar: {
		doProfile: "Profile",
		doSettings: "Settings",
		doLogout: "Logout",
	},
	mobileMenu: {
		srOnly: "Open main menu",
		transitionEnter: "animate-in fade-in-0 zoom-in-95",
		transitionExit: "animate-out fade-out-0 zoom-out-95",
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
	const userContext = useContext(UserContext);
	const uiContext = useContext(UiContext);

	const toInitials = (fullName: string) => {
		const split = fullName.split(" ");

		return [split.at(0)?.at(0), split.at(-1)?.at(0)]
			.filter(Boolean)
			.join("");
	};

	const getNextTheme = () => {
		if (uiContext().theme === "light") {
			return "dark";
		}

		return "light";
	};

	const toggleTheme = () => {
		uiContext().actions.setTheme(getNextTheme());

		if (isMobileMenuOpen()) {
			toggleMobileMenu();
		}
	};

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
										{resources.mobileMenu.srOnly}
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
											size="icon"
											variant="outline"
											onClick={toggleTheme}>
											<Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
											<Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
											<span class="sr-only">
												{resources.doSwitchTheme(
													getNextTheme(),
												)}
											</span>
										</Button>

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
										<DropdownMenuTrigger
											class={cn(
												"focus-visible: outline-none focus-visible:ring-ring focus-visible:ring-2",
												"focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full",
											)}>
											<Avatar class="size-8 sm:size-10">
												<AvatarImage
													src={
														userContext().profile
															?.avatar
													}
													alt={
														userContext().profile
															?.fullName
													}
												/>
												<AvatarFallback>
													{toInitials(
														userContext().profile
															?.fullName as string,
													)}
												</AvatarFallback>
											</Avatar>
										</DropdownMenuTrigger>

										<DropdownMenuContent class="mt-4 w-56">
											<DropdownMenuGroup>
												<DropdownMenuGroupLabel>
													{
														userContext().profile
															?.fullName
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
				enterActiveClass={resources.mobileMenu.transitionEnter}
				exitActiveClass={resources.mobileMenu.transitionExit}>
				<Show when={isMobileMenuOpen()}>
					<div class="bg-secondary transition-shadow">
						<div class="flex flex-col">
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

							<Button variant="ghost" onClick={toggleTheme}>
								{resources.doSwitchTheme(getNextTheme())}
							</Button>
						</div>
					</div>
				</Show>
			</Transition>
		</>
	);
};
