import type { Doc } from "@automerge/automerge-repo";
import type { MyPassportForm } from "common/epic/my-passport-form/types";
import { MyPassportFormVersion } from "common/epic/my-passport-form/types/MyPassportFormVersion.enum";
import { invariant } from "es-toolkit";

export const selectMyPassportForm = <T, U extends MyPassportForm>(
	doc: Doc<T | U> & { version?: string },
): Doc<U> => {
	invariant(doc.version, "Invalid passport form");

	if (doc.version === MyPassportFormVersion.V1_0) {
		return selectMyPassportFormV1(doc);
	}

	throw new Error("Unsupported version");
};

const selectMyPassportFormV1 = <
	TCurrent extends Record<string, any> = Record<string, any>,
	TPrevious extends Record<string, any> = Record<string, any>,
>(
	doc: Doc<TPrevious>,
): Doc<TCurrent> => doc as unknown as Doc<TCurrent>;
