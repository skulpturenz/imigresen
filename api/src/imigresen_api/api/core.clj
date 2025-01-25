(ns imigresen-api.api.core
  (:require
   [imigresen-api.app.routes :refer [defroute status-codes]]
   [reitit.swagger :refer [create-swagger-handler]]))

(defroute swagger-config-route "/docs/swagger.json" :get
  (create-swagger-handler)
  {:no-doc true
   :swagger {:info {:title "imigresen-api"}}})

(defroute health-check "/healthcheck" :get (fn [_req] {:status (:ok status-codes)
                                                       :body "."}))

(def handlers [swagger-config-route
               health-check])
