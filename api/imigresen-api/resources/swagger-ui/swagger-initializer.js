window.onload = function () {
    //<editor-fold desc="Changeable Configuration Block">

    let accessToken = "";
    let refreshToken = "";
    let accessExpires = -1;
    let refreshIntervalId;

    const toMs = (seconds) => seconds * Math.pow(10, 3);

    // the following lines will be replaced by docker/configurator, when it runs in a docker-container
    window.ui = SwaggerUIBundle({
        url: "https://petstore.swagger.io/v2/swagger.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
        ],
        requestInterceptor: request => {
            if (accessToken) {
                request.headers["Authorization"] = `Bearer ${accessToken}`;
            }

            return request;
        },
        responseInterceptor: async (response) => {
            if (response.body.token_type !== "Bearer") {
                return response;
            }

            const tokenParsed = response.body;
            accessToken = tokenParsed.access_token;
            refreshToken = tokenParsed.refresh_token;
            accessExpires = tokenParsed.expires_in;

            if (refreshIntervalId) {
                clearInterval(refreshIntervalId);
            }

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
                const res = await fetch("https://authnz.skulpture.xyz/realms/imigresen/protocol/openid-connect/token", {
                    method: "POST",
                    body: new URLSearchParams({
                        client_id: "swagger",
                        grant_type: "refresh_token",
                        refresh_token: refreshToken
                    })
                });

                const result = await res.json();

                console.debug("Refresh access token result", "ok?", res.ok, "result", result);
                if (res.ok) {
                    accessToken = result.access_token;
                    refreshToken = result.refresh_token;
                    accessExpires = result.expires_in;
                } else {
                    getNewAccessToken(retryCount + 1);
                }
            }

            refreshIntervalId = setInterval(() => {
                getNewAccessToken();
            }, toMs(accessExpires - 10));

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
