export const resources = {
	notFound: "404",
	metaTitle: "404 - Not Found",
	header: "Page not found",
	subtitle: (path?: string) => {
		if (!path) {
			return "Sorry, we couldn't find the page you're looking for.";
		}

		return (
			<>
				Sorry we couldn't find the page <code>/{path}</code>.
			</>
		);
	},
	doBackToHome: (
		<>
			Go back <code>/home</code>
		</>
	),
};
