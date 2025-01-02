import { styles } from "core/constants/styles";
import { AuthnContext } from "core/context/authn";
import { RouterContext } from "core/context/router";
import { UiContext } from "core/context/ui";
import { UserContext } from "core/context/user";
import { useContext } from "core/context/utils";
import { type RouteInternalProps, type RouteProps } from "core/router/route";
import { flatMapDeep } from "es-toolkit";
import { LogOut, Menu, Moon, Settings, Sun, User, X } from "lucide-solid";
import {
	createMemo,
	createSignal,
	For,
	Show,
	type Component,
	type ParentProps,
} from "solid-js";
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
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuDescription,
	NavigationMenuItem,
	NavigationMenuItemLabel,
	NavigationMenuLink,
	NavigationMenuTrigger,
} from "ui/navigation-menu";
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

export const Navbar: Component<ParentProps> = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
	const toggleMobileMenu = () =>
		setIsMobileMenuOpen(isMobileMenuOpen => !isMobileMenuOpen);

	const authContext = useContext(AuthnContext);
	const userContext = useContext(UserContext);
	const uiContext = useContext(UiContext);
	const routerContext = useContext(RouterContext);

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

	const MobileMenuTrigger = () => (
		<div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
			<Button size="icon" variant="ghost" onClick={toggleMobileMenu}>
				<span class="sr-only">{resources.mobileMenu.srOnly}</span>

				<Show when={!isMobileMenuOpen()}>
					<Menu aria-hidden="true" />
				</Show>

				<Show when={isMobileMenuOpen()}>
					<X aria-hidden="true" />
				</Show>
			</Button>
		</div>
	);

	const MobileMenu = () => (
		<Transition
			enterActiveClass={resources.mobileMenu.transitionEnter}
			exitActiveClass={resources.mobileMenu.transitionExit}>
			<Show when={isMobileMenuOpen()}>
				<div class="bg-secondary transition-shadow">
					<div class="flex flex-col">
						<Show when={!authContext().keycloak?.authenticated}>
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
						</Show>

						<Button variant="ghost" onClick={toggleTheme}>
							{resources.doSwitchTheme(getNextTheme())}
						</Button>
					</div>
				</div>
			</Show>
		</Transition>
	);

	const UserProfileDropdown = () => (
		<DropdownMenu placement="bottom">
			<DropdownMenuTrigger
				class={cn(
					"focus-visible: outline-none focus-visible:ring-ring focus-visible:ring-2",
					"focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full",
				)}>
				<Avatar class="size-8 sm:size-10">
					<AvatarImage
						src={userContext().profile?.avatar}
						alt={userContext().profile?.fullName}
					/>
					<AvatarFallback>
						{toInitials(userContext().profile?.fullName as string)}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>

			<DropdownMenuContent class="mt-4 w-56">
				<DropdownMenuGroup>
					<DropdownMenuGroupLabel>
						{userContext().profile?.fullName}
					</DropdownMenuGroupLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem class="flex gap-2">
						<User />
						<span>{resources.avatar.doProfile}</span>
					</DropdownMenuItem>
					<DropdownMenuItem class="flex gap-2">
						<Settings />
						<span>{resources.avatar.doSettings}</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem class="flex gap-2">
					<LogOut />
					<span>{resources.avatar.doLogout}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	const DesktopMenu = () => (
		<div class="hidden sm:flex gap-2">
			<Button size="icon" variant="outline" onClick={toggleTheme}>
				<Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				<span class="sr-only">
					{resources.doSwitchTheme(getNextTheme())}
				</span>
			</Button>

			<Button variant="secondary" onClick={authContext().actions.login}>
				{resources.doLogin}
			</Button>

			<Button onClick={authContext().actions.register}>
				{resources.doRegister}
			</Button>
		</div>
	);

	const getNavigationMenuItems = () => {
		const menuItems = Object.values(routerContext().routes)
			.filter(
				route =>
					!route.info?.isHidden &&
					route.info?.isAllowed &&
					// only top level routes
					((Array.isArray(route.path) &&
						route.path.some(
							path => path === route.info?.hrefPath,
						)) ||
						(!Array.isArray(route.path) &&
							route.info?.hrefPath === route.path)),
			)
			.map(route => {
				const getAllChildren = (
					currentRoute: RouteProps & RouteInternalProps,
				): (RouteProps & RouteInternalProps)[] => {
					if (Array.isArray(currentRoute.children)) {
						return [
							...currentRoute.children,
							...flatMapDeep(
								currentRoute.children ?? [],
								getAllChildren,
							),
						];
					}

					if (!currentRoute.children) {
						return [];
					}

					return [currentRoute.children];
				};

				return {
					trigger: route,
					children: getAllChildren(route),
				};
			});

		return menuItems;
	};

	const navigationMenuItems = createMemo(getNavigationMenuItems);

	const Navbar = () => (
		<NavigationMenu>
			<For each={navigationMenuItems()}>
				{menuItem => (
					<>
						<Show when={!menuItem.children.length}>
							<NavigationMenuTrigger
								as="a"
								href={menuItem.trigger.info?.hrefPath}>
								{menuItem.trigger.meta?.navigationConfig
									?.title || menuItem.trigger.title}
							</NavigationMenuTrigger>
						</Show>

						<Show when={menuItem.children.length}>
							<NavigationMenuItem>
								<NavigationMenuTrigger
									as="a"
									href={menuItem.trigger.info?.hrefPath}>
									{menuItem.trigger.meta?.navigationConfig
										?.title || menuItem.trigger.title}
								</NavigationMenuTrigger>

								<NavigationMenuContent>
									<For each={menuItem.children}>
										{link => (
											<NavigationMenuLink
												href={link.info?.hrefPath}>
												<NavigationMenuItemLabel>
													{link.meta?.navigationConfig
														?.title ||
														menuItem.trigger.title}
												</NavigationMenuItemLabel>

												<Show
													when={
														link.meta
															?.navigationConfig
															?.description
													}>
													<NavigationMenuDescription>
														{
															link.meta
																?.navigationConfig
																?.description
														}
													</NavigationMenuDescription>
												</Show>
											</NavigationMenuLink>
										)}
									</For>
								</NavigationMenuContent>
							</NavigationMenuItem>
						</Show>
					</>
				)}
			</For>
		</NavigationMenu>
	);

	return (
		<>
			<nav class="bg-muted py-4">
				<div class={cn(styles.contentContainer)}>
					<div class={cn(styles.narrowContentContainer, "space-y-4")}>
						<div class="relative flex h-16 items-center justify-between">
							<MobileMenuTrigger />

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
									<DesktopMenu />
								</Show>

								<Show
									when={
										authContext().keycloak?.authenticated
									}>
									<UserProfileDropdown />
								</Show>
							</div>
						</div>

						<Show when={navigationMenuItems().length}>
							<Navbar />
						</Show>
					</div>
				</div>
			</nav>

			<MobileMenu />
		</>
	);
};
