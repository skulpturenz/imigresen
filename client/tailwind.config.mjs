/// @ts-check

import { default as defaultTheme } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Manrope", ...defaultTheme.fontFamily.sans],
			},
		},
	},
	plugins: [],
};