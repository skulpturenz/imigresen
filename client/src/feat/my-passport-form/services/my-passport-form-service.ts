import { Repo, type NetworkAdapterInterface } from "@automerge/automerge-repo";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";

export const myPassportFormAutomergeRepo = (_token?: string) => {
	// invariant(
	// 	import.meta.env.VITE_API_AUTOMERGE_WSS,
	// 	"Automerge WSS endpoint not specified",
	// );

	const storage = new IndexedDBStorageAdapter(
		`imigresen-${import.meta.env.MODE}`,
		`imigresen-my-passport-${import.meta.env.MODE}`,
	);

	const network: NetworkAdapterInterface[] = [
		new BrowserWebSocketClientAdapter(
			import.meta.env.VITE_API_AUTOMERGE_WSS,
		),
	];

	return new Repo({
		storage,
		network,
	});
};
