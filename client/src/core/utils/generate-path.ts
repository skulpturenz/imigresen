import { invariant, isNil } from "es-toolkit";

export const generatePath = (path: string, routeParams: Record<string, any>) =>
	Object.entries(routeParams).reduce((path, [searchValue, replaceValue]) => {
		invariant(
			!isNil(replaceValue) && replaceValue?.toString(),
			`Route parameter for ${searchValue} is not defined`,
		);

		return path.replace(`:${searchValue}`, replaceValue.toString());
	}, path);
