window.onload = function () {
    //<editor-fold desc="Changeable Configuration Block">

    let token = "";

    // the following lines will be replaced by docker/configurator, when it runs in a docker-container
    window.ui = SwaggerUIBundle({
        url: "https://petstore.swagger.io/v2/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
        ],
        requestInterceptor: request => {
            if (token) {
                request.headers['Authorization'] = `Bearer ${token}`;
            }

            return request;
        },
        responseInterceptor: async (response) => {
            if (response.body.token_type !== "Bearer") {
                return response;
            }

            const tokenParsed = response.body;
            token = tokenParsed.access_token;

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
