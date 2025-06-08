import type { Doc } from "@automerge/automerge-repo";
import { MyPassportFormVersion } from "common/epic/my-passport-form/types/MyPassportFormVersion.enum";
import { invariant } from "es-toolkit";

export const selectMyPassportForm = <T>(doc: Doc<T> & { version?: string }) => {
	invariant(doc.version, "Invalid passport form");

	if (doc.version === MyPassportFormVersion.V1_0) {
		return selectMyPassportFormV1(doc);
	}

	throw new Error("Unsupported version");
};

const selectMyPassportFormV1 = <T>(doc: Doc<T>) => doc;
