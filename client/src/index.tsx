/* @refresh reload */
import "core/assets/tailwind.css";
import "core/assets/theme.css";
import { render } from "solid-js/web";
import { App } from "./App.tsx";

const root = document.getElementById("root");

render(() => <App />, root!);
