(ns imigresen-api.api.core
  (:require [imigresen-api.app.routes :refer [defroute status-codes defroutes]]
            [reitit.swagger :refer [create-swagger-handler]]
            [imigresen-api.api.example.core :as example]))

(defroute swagger-config-route "/docs/swagger.json" :get
  (create-swagger-handler)
  {:no-doc true
   :swagger {:info {:title "imigresen-api"}}})

(defroute health-check "/healthcheck" :get (fn [_req] {:status (:ok status-codes)
                                                       :body "."}))

(defroutes api-v1 "/api/v1" {:tags ["api.v1"]}
  example/example-routes)

(def handlers [swagger-config-route
               health-check
               api-v1])
