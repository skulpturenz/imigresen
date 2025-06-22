(ns imigresen-api.api.core
  (:require [imigresen-common.app.routes :refer [status-codes]]
            [reitit.swagger :refer [create-swagger-handler]]
            [reitit.swagger-ui :refer [create-swagger-ui-handler]]
            [imigresen-api.api.user.core :as user]))

(defn swagger-config []
  ["" {:no-doc true}
   ["/swagger.json" {:get {:handler (create-swagger-handler)
                           :no-doc true
                           :swagger {:info {:title "Imigresen"}
                                     :securityDefinitions {:oauth2 {:type "oauth2"
                                                                    :flow "authorizationCode"
                                                                    :authorizationUrl "https://authnz.skulpture.xyz/realms/imigresen/protocol/openid-connect/auth"
                                                                    :tokenUrl "https://authnz.skulpture.xyz/realms/imigresen/protocol/openid-connect/token"
                                                                    :scopes {:test "test scope"}}}}}}]
   ["/docs/*" {:get {:handler (create-swagger-ui-handler {:config {:showRequestHeaders true
                                                                   :jsonEditor true}})
                     :no-doc true}}]])

(defn ping []
  ["/ping" ["" {:get {:handler (fn [_req] {:status (:ok status-codes)
                                           :body "."})
                      :no-doc true}}]])

(defn api-v1 []
  ["/api/v1" {:tags ["api.v1"]}
   (user/user-routes)])

(defn handlers []
  [(swagger-config)
   (ping)
   (api-v1)])
