import { FeatureToggles } from "core/constants/feature-toggles.enum";
import { AuthnContext } from "core/context/authn";
// eslint-disable-next-line no-restricted-imports
import { FliptContext } from "core/context/flipt"; // special case of requiring import
import { useContext } from "core/context/utils"; // for use within a render, this throws if context is not defined!
import { noop } from "es-toolkit";

export const useDebug = () => {
	const fliptContext = useContext(FliptContext);
	const authnContext = useContext(AuthnContext);

	const isProdDebugLogEnabled = () =>
		fliptContext().flipt?.evaluateBoolean({
			flagKey: FeatureToggles.ProdDebugLog,
			entityId: authnContext().userId,
			context: {},
		}).enabled;

	const isDebugEnabled = () => {
		if (!import.meta.env.DEV && !isProdDebugLogEnabled()) {
			return false;
		}

		return true;
	};

	const $debug = <T extends (...args: any[]) => any>(fn: T) => {
		if (!isDebugEnabled) {
			return noop as T;
		}

		return fn;
	};

	$debug.isEnabled = isDebugEnabled;

	return $debug;
};
