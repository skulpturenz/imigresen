export const styles = {
	contentContainer: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
	narrowContentContainer: "mx-auto max-w-3xl",
	breakpoints: {
		isVerySmall: () => window.matchMedia("(width < 40rem)").matches,
		isSm: () => window.matchMedia("(width >= 40rem)").matches,
		isMd: () => window.matchMedia("(width >= 48rem)").matches,
		isLg: () => window.matchMedia("(width >= 64rem)").matches,
		isXl: () => window.matchMedia("(width >= 80rem)").matches,
		is2Xl: () => window.matchMedia("(width >= 96rem)").matches,
	},
};
