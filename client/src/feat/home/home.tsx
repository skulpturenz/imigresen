import { A } from "@solidjs/router";
import { MyPassportForm } from "core/constants/my-passport-form-route.enum";
import { useI18n } from "core/context/i18n";
import { toPath } from "core/router/route";
import { For, Show } from "solid-js";
import { Button } from "ui/button";
import { usePassportApplications } from "./hooks/usePassportApplications";
import type { resources } from "./resources/i18n/en-US";

export const Home = () => {
	const { queries } = usePassportApplications();
	const t = useI18n<typeof resources>();

	return (
		<div>
			<div class="flex justify-end my-8">
				<Button as="a" href={toPath(MyPassportForm.New)}>
					{t("doApply")}
				</Button>
			</div>

			<Show when={!queries.passportApplications.isLoading}>
				<div class="bg-background">
					<ul>
						<For each={queries.passportApplications.data}>
							{item => {
								const getHref = () => {
									const url = new URL(location.origin);
									url.hash = location.hash;

									const searchParams = new URLSearchParams({
										automergeUrl: item.automergeUrl,
									});

									url.pathname = MyPassportForm.Edit.replace(
										":uuid",
										item.uuid,
									);
									url.search = searchParams.toString();

									return url.href;
								};

								return (
									<li class="text-foreground">
										<A href={getHref()}>
											{item.uuid} (First name:{" "}
											{item.personalDetails.firstName},
											Last name:{" "}
											{item.personalDetails.lastName})
										</A>
									</li>
								);
							}}
						</For>
					</ul>
				</div>
			</Show>
		</div>
	);
};
