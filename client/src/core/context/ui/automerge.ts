import { Repo, type NetworkAdapterInterface } from "@automerge/automerge-repo";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { invariant } from "es-toolkit";

const storage = new IndexedDBStorageAdapter(
	`imigresen-automerge-${import.meta.env.MODE}`,
	`imigresen-documents-${import.meta.env.MODE}`,
);

invariant(import.meta.env.VITE_CF_AUTOMERGE_WSS, "Automerge API not specified");

const network: NetworkAdapterInterface[] = [
	new BrowserWebSocketClientAdapter(import.meta.env.VITE_CF_AUTOMERGE_WSS),
];

export const repo = new Repo({
	storage,
	network,
	sharePolicy: async () => true,
	enableRemoteHeadsGossiping: true,
});
