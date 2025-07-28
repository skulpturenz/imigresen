import { object } from "yup";
import { addressDetails } from "./address-details";
import { applicationDetails } from "./application-details";
import { declaration } from "./declaration";
import { personalDetails } from "./personal-details";
import { previousDocuments } from "./previous-documents";

export const myPassportForm = object({
	personalDetails,
	addressDetails,
	applicationDetails,
	previousDocuments,
	declaration,
});
