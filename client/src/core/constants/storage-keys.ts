export const storageKeys = {
	myPassportFormBase: `imigresen-${import.meta.env.MODE}:my-passport-form:`,
	myPassportFormApplications: (sub?: string) => {
		if (!sub) {
			return ["public"].join(":");
		}

		return ["user", sub].join(":");
	},
	myPassportFormApplication: (uuid: string, sub?: string) => {
		if (!sub) {
			return ["public", uuid].join(":");
		}

		return ["user", sub, uuid].join(":");
	},
	authCookie: "IMIGRESEN_AUTH_COOKIE",
};
