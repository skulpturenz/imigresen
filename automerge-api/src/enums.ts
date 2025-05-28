export enum StatusCode {
	UpgradeRequired = 426,
	SwitchingProtocols = 101,
	BadRequest = 400,
	InternalServerError = 500,
}

export enum HttpMethod {
	Get = "GET",
	Options = "OPTIONS",
}

export enum HttpHeaders {
	UpgradeInsecureRequests = "Upgrade-Insecure-Requests",
	Upgrade = "Upgrade",
}
