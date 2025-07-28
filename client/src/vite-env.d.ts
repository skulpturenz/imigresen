/// <reference types="vite/client" />

interface ViteTypeOptions {
	strictImportMetaEnv: unknown;
}

type Mode = "production" | "development" | "test" | "storybook";

interface ImportMetaEnv {
	readonly VITE_KEYCLOAK_URL: string;
	readonly VITE_KEYCLOAK_REALM: string;
	readonly VITE_KEYCLOAK_CLIENT_ID: string;
	readonly VITE_FLIPT_URL: string;
	readonly VITE_FLIPT_NAMESPACE: string;
	readonly VITE_AUTOMERGE_WSS: string;
	readonly VITE_MAPBOX_ACCESS_TOKEN: string;
	readonly VITE_FORMBRICKS_ENVIRONMENT: string;
	readonly VITE_API_BASE_URL: string;
	readonly MODE: Mode;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
