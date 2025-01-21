(ns imigresen-api.app.core
  (:require
   [reitit.ring :refer [ring-handler router routes create-default-handler]]
   [reitit.swagger]
   [reitit.swagger-ui :refer [create-swagger-ui-handler]]
   [reitit.dev.pretty]
   [reitit.coercion.spec]
   [reitit.ring.middleware.parameters]
   [reitit.ring.middleware.muuntaja]
   [reitit.ring.coercion]
   [reitit.ring.middleware.exception]
   [muuntaja.core]
   [reitit.ring.middleware.multipart]
   [mount.core]
   [imigresen-api.api.core :refer [handlers]]))

(mount.core/start)

(def app
  (ring-handler
   (router handlers {:exception reitit.dev.pretty/exception
                     :data {:coercion reitit.coercion.spec/coercion
                            :muuntaja muuntaja.core/instance
                            :middleware [reitit.swagger/swagger-feature ;; swagger feature 
                                         reitit.ring.middleware.parameters/parameters-middleware ;; query-params & form-params
                                         reitit.ring.middleware.muuntaja/format-negotiate-middleware ;; content-negotiation
                                         reitit.ring.middleware.muuntaja/format-response-middleware ;; encoding response body
                                         reitit.ring.middleware.exception/exception-middleware ;; exception handling
                                         reitit.ring.middleware.muuntaja/format-request-middleware ;; decoding request body
                                         reitit.ring.coercion/coerce-response-middleware ;; coercing response bodys
                                         reitit.ring.coercion/coerce-request-middleware ;; coercing request parameters
                                         ;; multipart
                                         reitit.ring.middleware.multipart/multipart-middleware]}})

   (routes (create-swagger-ui-handler
            ;; oauth
            {:path "/docs"
             :config {:validatorUrl nil
                      :urls [{:name "swagger" :url "swagger.json"}]
                      :urls.primaryName "swagger"
                      :operationsSorter "alpha"}})
           (create-default-handler [:not-found :method-not-allowed :not-acceptable]))))
