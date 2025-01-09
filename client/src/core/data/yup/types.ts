import type { Accessor } from "solid-js";
import type { ValidateOptions as YupValidateOptions } from "yup";

export interface ValidateOptions<
	TContext extends Record<string, any> = Record<string, any>,
> extends Omit<YupValidateOptions, "context"> {
	context: Accessor<TContext>;
}
