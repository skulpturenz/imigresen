(ns imigresen-api.api.core
  (:require [imigresen-api.app.routes :refer [status-codes]]
            [reitit.swagger :refer [create-swagger-handler]]
            [imigresen-api.api.user.core :as user]))

(defn swagger-config []
  ["/docs/swagger.json" {:get {:handler (create-swagger-handler)
                               :no-doc true
                               :swagger {:info {:title "imigresen-api"}}}}])

(defn health-check []
  ["/healthcheck" ["" {:get {:handler (fn [_req] {:status (:ok status-codes)
                                                  :body "."})
                             :no-doc true}}]])

(defn api-v1 []
  ["/api/v1" {:tags ["api.v1"]}
   user/user-routes])

(defn handlers []
  [(swagger-config)
   (health-check)
   (api-v1)])
