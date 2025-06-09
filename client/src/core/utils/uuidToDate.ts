import { UUID } from "uuidv7";

// from: https://gist.github.com/wllmsash/bcb337ce0662ed044012e2d7170f7ed0
export const uuidToDate = (uuid: UUID) => {
	const timestampBytes = new Uint8Array(8);
	timestampBytes.set(
		// first 6 bytes are timestamp
		new Uint8Array(uuid.bytes.buffer.slice(0, 6)),
		// leave first 2 bytes empty
		// `getBigUint64` reads 8 bytes
		2,
	);

	// unix timestamp
	const timestampMs = new DataView(timestampBytes.buffer).getBigUint64(0);

	return new Date(Number(timestampMs));
};
