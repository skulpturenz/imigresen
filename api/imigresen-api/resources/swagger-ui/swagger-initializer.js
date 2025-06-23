window.onload = function () {
    //<editor-fold desc="Changeable Configuration Block">

    // the following lines will be replaced by docker/configurator, when it runs in a docker-container
    window.ui = SwaggerUIBundle({
        url: "https://petstore.swagger.io/v2/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
        ],
        persistAuthorization: true,
        responseInterceptor: async (response) => {
            console.log(response); // TODO: remove


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
                                authorizeOauth2: (oriAction, system) => (payload) => {
                                    payload.auth.code = ""
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
