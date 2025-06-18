import { A } from "@solidjs/router";
import { useI18n } from "core/context/i18n";
import { TextArea } from "ui/text-area";
import { TextFieldRoot } from "ui/text-field";
import { cn } from "ui/utils";
import type { resources } from "./resources/i18n/en-us";

export const Home = () => {
	const t = useI18n<typeof resources>();

	return (
		<>
			<div class="flex flex-col h-[calc(100vh-10rem)] items-center justify-center">
				<div class="md:self-end">
					<A
						href="/"
						class={cn(
							"font-black uppercase text-muted-foreground",
							"hover:text-foreground transition text-2xl sm:text-6xl",
						)}>
						{t("v2.logo")}
					</A>
				</div>

				<div class="flex flex-col h-full w-full">
					<div class="flex-1"></div>
					<TextFieldRoot class="self-end w-full">
						<TextArea
							autofocus
							placeholder={t("v2.askMeAnything")}
						/>
					</TextFieldRoot>
				</div>
			</div>
		</>
	);
};
