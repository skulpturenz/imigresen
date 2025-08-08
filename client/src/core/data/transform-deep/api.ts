import { createConformer, transformDeep } from "./transform-deep";

const conformSerializedDate = createConformer(
	value => new Date(value as string),
	value => typeof value === "string" && !Number.isNaN(new Date(value)),
);

export const normalizeResponse = <U, T = any>(value: T) =>
	transformDeep<T, U>(value, [conformSerializedDate]);
