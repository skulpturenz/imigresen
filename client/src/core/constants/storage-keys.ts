export const storageKeys = {
	myPassportFormBase: `imigresen-${import.meta.env.MODE}:my-passport-form:`,
	myPassportFormApplications: (user?: string) => {
		if (!user) {
			return ["public"].join(":");
		}

		return ["user", user].join(":");
	},
	myPassportFormApplication: (uuid: string, user?: string) => {
		if (!user) {
			return ["public", uuid].join(":");
		}

		return ["user", user, uuid].join(":");
	},
	authCookie: "IMIGRESEN_AUTH_COOKIE",
	onboardingFlag: (user?: string) => ["user", user, "onboarding"].join(":"),
};
