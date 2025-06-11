import type { Component } from "solid-js";
import type { PageMetaData } from "./page-meta-map";

// must contain an element with id="root"
const PageTemplate: Component<PageMetaData> = ({ title, description }) => {
	return (
		<html lang="en">
			<head>
				<title>{title}</title>
				<meta name="description" content={description} />
			</head>
			<body>
				<div id="root"></div>
			</body>
		</html>
	);
};

/* eslint-disable-next-line */
export default PageTemplate;
