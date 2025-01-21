(ns imigresen-api.api.core
  (:require
   [imigresen-api.api.routes :refer [defroute]]
   [reitit.swagger :refer [create-swagger-handler]]))

(defroute swagger-config-route "Test!" "/docs/swagger.json" :get
  (create-swagger-handler)
  {:no-doc true
   :swagger {:info {:title "imigresen-api"}}})

(def handlers [swagger-config-route])
