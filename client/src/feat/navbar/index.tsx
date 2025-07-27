import { FeatureToggles } from "core/constants/feature-toggles.enum";
import { styles } from "core/constants/styles";
import { UserRoute } from "core/constants/user-route.enum";
import { AuthnContext } from "core/context/authn";
import { FliptContext } from "core/context/flipt";
import { RouterContext } from "core/context/router";
import { UiContext } from "core/context/ui";
import { UserContext, type UserProfile } from "core/context/user";
import { useContext } from "core/context/utils";
import { type RouteInternalProps, type RouteProps } from "core/router/route";
import { useNavigate } from "@solidjs/router";
import { flatMapDeep } from "es-toolkit";
import {
	Earth,
	LogOut,
	Menu,
	Moon,
	Settings,
	Sun,
	User,
	X,
} from "lucide-solid";
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
import type { NavbarItem } from "./types";
import { sortNavbarItems, sortNavigationRoutes } from "./utils";

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

	const authnContext = useContext(AuthnContext);
	const userContext = useContext(UserContext);
	const uiContext = useContext(UiContext);
	const routerContext = useContext(RouterContext);
	const fliptContext = useContext(FliptContext);
	const navigate = useNavigate();

	const toFullName = (profile: UserProfile) =>
		[profile.firstName, profile.lastName].filter(Boolean).join(" ");

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
						<Show when={!authnContext().keycloak?.authenticated}>
							<Button
								variant="ghost"
								onClick={authnContext().actions.login}>
								{resources.doLogin}
							</Button>

							<Button
								variant="ghost"
								onClick={authnContext().actions.register}>
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
						src={userContext().profile?.avatarHref}
						alt={toFullName(userContext().profile as UserProfile)}
					/>
					<AvatarFallback>
						{toInitials(
							toFullName(userContext().profile as UserProfile),
						)}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>

			<DropdownMenuContent class="mt-4 w-56">
				<DropdownMenuGroup>
					<DropdownMenuGroupLabel>
						{toFullName(userContext().profile as UserProfile)}
					</DropdownMenuGroupLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem class="flex gap-2" onClick={() => navigate(`/${UserRoute.Profile}`)}>
						<User />
						<span>{resources.avatar.doProfile}</span>
					</DropdownMenuItem>
					<DropdownMenuItem class="flex gap-2">
						<Settings />
						<span>{resources.avatar.doSettings}</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					class="flex gap-2"
					onClick={authnContext().actions.logout}>
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

			<Button variant="secondary" onClick={authnContext().actions.login}>
				{resources.doLogin}
			</Button>

			<Button onClick={authnContext().actions.register}>
				{resources.doRegister}
			</Button>
		</div>
	);

	const getNavbarItems = () => {
		const navbarItems = Object.values(routerContext().routes)
			.reduce<NavbarItem[]>((acc, route) => {
				if (
					route.info?.isHidden ||
					!route.info?.isAllowed ||
					!isTopLevelRoute(route)
				) {
					return acc;
				}

				return [
					...acc,
					{
						trigger: route,
						children:
							getAllChildren(route).sort(sortNavigationRoutes),
					},
				];
			}, [])
			.sort(sortNavbarItems);

		return navbarItems;
	};

	const navbarItems = createMemo(getNavbarItems);

	const Navbar = () => (
		<NavigationMenu>
			<For each={navbarItems()}>
				{navbarItem => (
					<>
						<Show when={!navbarItem.children.length}>
							<NavigationMenuTrigger
								as="a"
								class="border border-accent"
								href={navbarItem.trigger.info?.hrefPath}>
								{navbarItem.trigger.meta?.navigationConfig
									?.title || navbarItem.trigger.title}
							</NavigationMenuTrigger>
						</Show>

						<Show when={navbarItem.children.length}>
							<NavigationMenuItem>
								<NavigationMenuTrigger
									as="a"
									class="border border-accent"
									href={navbarItem.trigger.info?.hrefPath}>
									{navbarItem.trigger.meta?.navigationConfig
										?.title || navbarItem.trigger.title}
								</NavigationMenuTrigger>

								<NavigationMenuContent>
									<For each={navbarItem.children}>
										{navbarItemChild => (
											<NavigationMenuLink
												href={
													navbarItemChild.info
														?.hrefPath
												}>
												<NavigationMenuItemLabel>
													{navbarItemChild.meta
														?.navigationConfig
														?.title ||
														navbarItem.trigger
															.title}
												</NavigationMenuItemLabel>

												<Show
													when={
														navbarItemChild.meta
															?.navigationConfig
															?.description
													}>
													<NavigationMenuDescription>
														{
															navbarItemChild.meta
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

	const isHomeV2Enabled = () =>
		fliptContext().flipt?.evaluateBoolean({
			flagKey: FeatureToggles.HomeV2,
			entityId: authnContext().userId,
			context: {
				environment: import.meta.env.MODE,
			},
		}).enabled;

	return (
		<Show when={!isHomeV2Enabled()}>
			<nav class="shadow shadow-accent py-4">
				<div class={cn(styles.contentContainer)}>
					<div class={cn(styles.narrowContentContainer, "space-y-4")}>
						<div class="relative flex h-16 items-center justify-between">
							<MobileMenuTrigger />

							<div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
								<div class="flex shrink-0 items-center">
									<a
										href="/"
										class="flex items-center gap-3 sm:gap-4 font-bold uppercase text-2xl sm:text-3xl">
										<Earth class="h-10 sm:h-12 w-auto" />

										{resources.logoAlt}
									</a>
								</div>
							</div>

							<div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
								<Show
									when={
										!authnContext().keycloak?.authenticated
									}>
									<DesktopMenu />
								</Show>

								<Show
									when={
										authnContext().keycloak?.authenticated
									}>
									<UserProfileDropdown />
								</Show>
							</div>
						</div>

						<Show when={navbarItems().length}>
							<Navbar />
						</Show>
					</div>
				</div>
			</nav>

			<MobileMenu />
		</Show>
	);
};

const isTopLevelRoute = (route: RouteProps & RouteInternalProps) =>
	(Array.isArray(route.path) &&
		route.path.some(path => path === route.info?.hrefPath)) ||
	(!Array.isArray(route.path) && route.info?.hrefPath === route.path);

const getAllChildren = (
	currentRoute: RouteProps & RouteInternalProps,
): (RouteProps & RouteInternalProps)[] => {
	if (Array.isArray(currentRoute.children)) {
		return [
			...currentRoute.children,
			...flatMapDeep(currentRoute.children ?? [], getAllChildren),
		];
	}

	if (!currentRoute.children) {
		return [];
	}

	return [currentRoute.children];
};
