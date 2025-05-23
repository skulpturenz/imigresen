import { useI18n } from "core/context/i18n";
import type { resources } from "feat/my-passport-form/resources/i18n/en-US";

export const ApplicationDetails = () => {
	const t = useI18n<typeof resources>();

	return (
		<>
			<div>Application details!!!</div>
		</>
	);
};
