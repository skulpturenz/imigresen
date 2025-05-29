import { Repo, type NetworkAdapterInterface } from "@automerge/automerge-repo";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { invariant } from "es-toolkit";

const storage = new IndexedDBStorageAdapter(
	`imigresen-automerge-${import.meta.env.MODE}`,
	`imigresen-documents-${import.meta.env.MODE}`,
);

invariant(import.meta.env.VITE_AUTOMERGE_WSS, "Automerge API not specified");

export const network: NetworkAdapterInterface[] = [];

export const repo = new Repo({
	storage,
	network,
	sharePolicy: async () => true,
	enableRemoteHeadsGossiping: true,
});
