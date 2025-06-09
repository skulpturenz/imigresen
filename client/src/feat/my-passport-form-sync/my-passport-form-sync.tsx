import { useI18n } from "core/context/i18n";
import { For, Show } from "solid-js";
import { Button } from "ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "ui/dialog";
import { useMyPassportFormSync } from "./hooks";
import type { resources } from "./resources/i18n/en-US";
import { PassportApplicationLi } from "./ui/passport-application-li";

export const MyPassportFormSync = () => {
	const {
		data,
		isOpen,
		toggleIsOpen,
		setFormRef,
		onClickImport,
		onClickCancel,
	} = useMyPassportFormSync();

	const t = useI18n<typeof resources>();

	return (
		<Show when={data.publicApplications()?.length}>
			<Dialog open={isOpen()} onOpenChange={toggleIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("title")}</DialogTitle>
						<DialogDescription>
							{t("description")}
						</DialogDescription>
					</DialogHeader>

					<form ref={setFormRef}>
						<ol class="flex flex-col space-y-4 my-4">
							<For each={data.publicApplications()}>
								{application => (
									<>
										<PassportApplicationLi
											uuid={application.uuid}
											automergeUrl={
												application.automergeUrl
											}
										/>
									</>
								)}
							</For>
						</ol>
					</form>

					<DialogFooter>
						<Button variant="ghost" onClick={onClickCancel}>
							{t("doCancel")}
						</Button>

						<Button type="submit" onClick={onClickImport}>
							{t("doImport")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Show>
	);
};
