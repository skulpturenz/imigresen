import { Repo, type NetworkAdapterInterface } from "@automerge/automerge-repo";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { assertEnv } from "core/utils/assert-env";

const storage = new IndexedDBStorageAdapter(
	`imigresen-automerge-${import.meta.env.MODE}`,
	`imigresen-documents-${import.meta.env.MODE}`,
);

assertEnv(import.meta.env.VITE_AUTOMERGE_WSS, "Automerge API not specified");

export const network: NetworkAdapterInterface =
	new BrowserWebSocketClientAdapter(import.meta.env.VITE_AUTOMERGE_WSS);

export const repo = new Repo({
	storage,
	sharePolicy: async () => true,
	enableRemoteHeadsGossiping: true,
});
