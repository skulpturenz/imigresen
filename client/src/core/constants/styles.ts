export const styles = {
	contentContainer: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
	narrowContentContainer: "mx-auto max-w-6xl",
	breakpoints: {
		isVerySmall: () => window.matchMedia("(width < 40rem)").matches,
		isSmall: () => window.matchMedia("(width >= 40rem)").matches,
		isMedium: () => window.matchMedia("(width >= 48rem)").matches,
		isLarge: () => window.matchMedia("(width >= 64rem)").matches,
		isExtraLarge: () => window.matchMedia("(width >= 80rem)").matches,
		isExtraLargeTwice: () => window.matchMedia("(width >= 96rem)").matches,
	},
	device: {
		hasHover: () => window.matchMedia("(hover: hover)").matches,
	},
};
