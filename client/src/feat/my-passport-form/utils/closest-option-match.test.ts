import { describe, expect, it } from "vitest";
import { closestOptionMatch } from "./closest-option-match";

describe("closest-option-match", () => {
	it("picks closest match to value in options", () => {
		const countryOptions = {
			Malaysia: "Malaysia",
			Afghanistan: "Afghanistan",
			Albania: "Albania",
			Algeria: "Algeria",
			Andorra: "Andorra",
			Angola: "Angola",
			Argentina: "Argentina",
			Armenia: "Armenia",
			Australia: "Australia",
			NewZealand: "New Zealand",
		};

		const value = "ausstraelia";

		expect(closestOptionMatch(value, countryOptions)).toBe(
			countryOptions.Australia,
		);
	});
});
