(ns imigresen-api.api.core
  (:require [imigresen-common.app.routes :as imi-routes]
            [reitit.openapi :as reitit-openapi]))

(defn swagger-config []
  ["/swagger.json" {:get {:handler (reitit-openapi/create-openapi-handler)
                          :no-doc true
                          :openapi {:info {:title "Imigresen"}
                                    :components {:securitySchemes
                                                 {:openIdConnect {:type "openIdConnect"
                                                                  :openIdConnectUrl "https://authnz.skulpture.xyz/realms/imigresen/.well-known/openid-configuration"}}}}}}])

(defn ping []
  ["/ping" ["" {:get {:handler (constantly {:status (:ok imi-routes/status-codes) :body "."})
                      :no-doc true}}]])

;; (defn api-v1 []
;;   ["/api/v1" {:tags ["api.v1"]}
;;    (user/user-routes)])

(defn handlers []
  [(swagger-config)
   (ping)
   ;;(api-v1)
   ])
