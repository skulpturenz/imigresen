import { Repo, type NetworkAdapterInterface } from "@automerge/automerge-repo";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";

const storage = new IndexedDBStorageAdapter(
	`imigresen-automerge-${import.meta.env.MODE}`,
	`imigresen-documents-${import.meta.env.MODE}`,
);

const network: NetworkAdapterInterface[] = [
	// TODO
	new BrowserWebSocketClientAdapter("ws://localhost:8787/api/v1"),
	// new BrowserWebSocketClientAdapter("ws://localhost:5173"),
];

export const repo = new Repo({
	storage,
	network,
	sharePolicy: async () => true,
	enableRemoteHeadsGossiping: true,
});
