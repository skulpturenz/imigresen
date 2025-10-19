import type { createForm, FieldValues } from "@modular-forms/solid";
import type { ComponentProps } from "solid-js";

export const withCustomTransform =
	<T extends FieldValues>(C: ReturnType<typeof createForm<T>>[1]["Field"]) =>
	(props: ComponentProps<typeof C>) => {
		if (props.type === "Date") {
			return (
				<C
					{...props}
					type="string"
					transform={value => {
						if (!value) {
							return value;
						}

						return new Date(value);
					}}
				/>
			);
		}

		return <C {...props} />;
	};
