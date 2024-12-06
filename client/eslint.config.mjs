/// @ts-check

import { default as js } from "@eslint/js";
import { flatConfigs as importPluginFlatConfig } from "eslint-plugin-import";
import { default as eslintPluginPrettierRecommended } from "eslint-plugin-prettier/recommended";
import { default as solid } from "eslint-plugin-solid/configs/typescript";
import { default as tseslint } from "typescript-eslint";

export default [
	js.configs.recommended,
	importPluginFlatConfig.recommended,
	...tseslint.configs.recommended,
	{
		plugins: {
			"@typescript-eslint": tseslint.plugin,
		},
	},
	{
		files: ["**/*.{ts,tsx}"],
		...solid,
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			eqeqeq: "error",
			"no-duplicate-imports": "error",
			"import/no-nodejs-modules": [
				"error",
				{
					allow: [],
				},
			],
			"import/no-namespace": "error",
			"import/no-default-export": "error",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_" },
			],
			"@typescript-eslint/no-empty-object-type": "warn",
		},
	},
	eslintPluginPrettierRecommended,
];
