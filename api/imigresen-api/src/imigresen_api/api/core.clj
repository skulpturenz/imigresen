(ns imigresen-api.api.core
  (:require [imigresen-common.app.routes :as imi-routes]
            [reitit.openapi :as reitit-openapi]
            [ring.util.response :as res]
            [imigresen-common.app.auth :as imi-auth]
            [imigresen-common.app.swagger :as swagger]
            [camel-snake-kebab.core :as csk]))

(defn swagger-config []
  ["/openapi.json" {:get {:handler (reitit-openapi/create-openapi-handler)
                          :no-doc true
                          :middleware [(swagger/create-transform-middleware csk/->camelCase)]
                          :openapi {:info {:title "Imigresen"}
                                    :components {:securitySchemes
                                                 {:openIdConnect {:type "openIdConnect"
                                                                  :openIdConnectUrl "https://authnz.skulpture.xyz/realms/imigresen/.well-known/openid-configuration"}}}}}}])

(defn ping []
  ["/ping" ["" {:get {:handler (constantly (-> (res/response ".")
                                               (res/content-type (:plain-text imi-routes/content-types))))
                      :no-doc true}}]])

(defn api-v1 []
  ["/api/v1" {:tags ["api.v1"]}
   ["/test/:test-path-param" {:get {:summary "test route"
                                    :handler (constantly {:status (:ok imi-routes/status-codes)
                                                          :body {:hello "world"}})
                                    :parameters {:path {:test-path-param int?}
                                                 :query {:test-search-param string?}}
                                    :responses {(:ok imi-routes/status-codes) {:description "Success!"
                                                                               :body {:hello string?}}
                                                (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}}
                                    ;; :middleware [imi-auth/protect] ;;
                                    }}]])

(defn handlers []
  [(swagger-config)
   (ping)
   (api-v1)])
