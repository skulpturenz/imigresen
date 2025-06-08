// TODO: shared type
export interface PassportApplication {
	personalDetails: {
		firstName: string;
		lastName: string;
	};
	uuid: string;
	automergeUrl: string;
}
