window.onload = function () {
    //<editor-fold desc="Changeable Configuration Block">

    class Keycloak {
        accessToken = "";
        #refreshToken = "";
        #accessExpiresSeconds = -1;
        #refreshIntervalId = null;

        #tokenEndpoint = "https://authnz.skulpture.xyz/realms/imigresen/protocol/openid-connect/token";

        init(authenticatedResponse) {
            this.accessToken = authenticatedResponse.access_token;
            this.#refreshToken = authenticatedResponse.refresh_token;
            this.#accessExpiresSeconds = authenticatedResponse.expires_in;

            this.#refreshAccessToken();
        }

        #refreshAccessToken() {
            if (this.#refreshIntervalId) {
                clearInterval(this.#refreshIntervalId);
            }

            if (!this.accessToken || !this.#refreshToken || !~this.#accessExpiresSeconds) {
                throw new Error("Unable to refresh tokens, must be authenticated first");
            }

            const toMs = (seconds) => seconds * Math.pow(10, 3);

            const getNewAccessToken = async (retryCount = 0) => {
                // Not sure what causes this but sometimes the first request
                // returns an error response saying that the session is not active
                // The second request ends up being successful
                // Unable to reproduce with a direct API request so not sure what's causing it
                // might be the session state cookies which are present when we make a browser request
                if (retryCount === 5) {
                    throw new Error("Unable to refresh token");
                }

                console.debug("Refreshing access token", "retry count", retryCount);

                const res = await fetch(this.#tokenEndpoint, {
                    method: "POST",
                    body: new URLSearchParams({
                        client_id: "swagger",
                        grant_type: "refresh_token",
                        refresh_token: this.#refreshToken
                    })
                });

                const result = await res.json();

                console.debug("Refresh access token result", "ok?", res.ok, "result", result);
                if (!res.ok) {
                    return getNewAccessToken(retryCount + 1);
                }

                this.accessToken = result.access_token;
                this.#refreshToken = result.refresh_token;
                this.#accessExpiresSeconds = result.expires_in;

                console.debug("Access token refreshed next in (seconds)", this.#accessExpiresSeconds);
            }

            this.#refreshIntervalId = setInterval(() => {
                getNewAccessToken();
            }, toMs(this.#accessExpiresSeconds - 10));
        }

        static isAuthenticatedResponse(authenticatedResponse) {
            return authenticatedResponse?.token_type === "Bearer";
        }
    }

    const kc = new Keycloak();

    // the following lines will be replaced by docker/configurator, when it runs in a docker-container
    window.ui = SwaggerUIBundle({
        url: "https://petstore.swagger.io/v2/swagger.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        displayRequestDuration: true,
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
        ],
        requestInterceptor: request => {
            if (kc.accessToken) {
                request.headers["Authorization"] = `Bearer ${kc.accessToken}`;
            }

            return request;
        },
        responseInterceptor: async (response) => {
            if (!Keycloak.isAuthenticatedResponse(response.body)) {
                return response;
            }

            kc.init(response.body);

            return response;
        },
        plugins: [
            SwaggerUIBundle.plugins.DownloadUrl,
            // fix: clearing authorization code when logging out
            // https://github.com/swagger-api/swagger-ui/issues/6034
            function () {
                return {
                    statePlugins: {
                        auth: {
                            wrapActions: {
                                authorizeOauth2: (oriAction, _system) => (payload) => {
                                    payload.auth.code = "";

                                    return oriAction(payload)
                                }
                            }
                        }
                    }
                }
            }
        ],
        // Provided by ring-swagger
        configUrl: "./config.json",
        layout: "StandaloneLayout"
    });

    window.ui.initOAuth({
        clientId: "swagger",
        usePkceWithAuthorizationCodeGrant: true,
        scopes: ["openid", "roles", "profile", "email"],
    })

    //</editor-fold>
};
