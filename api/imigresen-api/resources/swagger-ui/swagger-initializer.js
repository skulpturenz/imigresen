const loadScript = (url) => {
    const element = document.createElement("script");
    element.src = url;

    document.head.appendChild(element);
}

const scripts = [
    "https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js"
];
scripts.forEach(loadScript);

window.onload = function () {
    //<editor-fold desc="Changeable Configuration Block">

    const AUTH_COOKIE_KEY = "IMIGRESEN_AUTH_COOKIE";
    const millisecondsInSecond = 1000;

    const setAuthCookie = (tokenParsed) => {
        if (!tokenParsed) {
            return;
        }

        const cookie = Cookies.set(
            AUTH_COOKIE_KEY,
            tokenParsed.access_token,
            {
                domain: `.${window.location.hostname}`,
                expires: new Date(
                    Date.now() + ((tokenParsed.expires_in ?? 0) * millisecondsInSecond),
                ),
                secure: false,
                sameSite: "Strict",
            },
        );

        if (!cookie) {
            return;
        }

        window.document.cookie = cookie;
    };

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
            if (response.body.token_type !== "Bearer") {
                return response;
            }

            const tokenParsed = response.body;
            setAuthCookie(tokenParsed);

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
