/* @refresh reload */
import { init } from "@sentry/solid";
import "core/assets/tailwind.css";
import "core/assets/theme.css";
import { render } from "solid-js/web";
import { App } from "./core/ui/app";

if (import.meta.env.PROD) {
	init({
		dsn: "https://141811b132a84088aa15384e72d5156a@triage.skulpture.xyz/1",
		sendDefaultPii: true,
		integrations: [],
	});
}

const root = document.getElementById("root");

render(() => <App />, root!);
