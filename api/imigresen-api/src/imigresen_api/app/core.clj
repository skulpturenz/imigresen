(ns imigresen-api.app.core
  (:require [reitit.ring :refer [redirect-trailing-slash-handler ring-handler router routes create-default-handler]]
            [reitit.swagger]
            [reitit.swagger-ui :refer [create-swagger-ui-handler]]
            [reitit.dev.pretty]
            [reitit.coercion.spec]
            [reitit.ring.middleware.parameters]
            [reitit.ring.middleware.muuntaja]
            [reitit.ring.coercion]
            [reitit.ring.middleware.exception :as exception]
            [muuntaja.core :as m]
            [reitit.ring.middleware.multipart]
            [mount.core :as mount]
            [imigresen-api.api.core :refer [handlers]]
            [imigresen-common.state.db.core]
            [imigresen-common.state.flipt.core]
            [camel-snake-kebab.core :refer [->camelCase ->kebab-case]]
            [imigresen-common.app.routes :refer [content-types with-authnz status-codes]]
            [imigresen-common.app.middleware.cors :refer [cors-middleware]]
            [imigresen-common.app.middleware.query-string :refer [query-string-middleware]]
            [ring.util.response :refer [status]]
            [buddy.auth :as bauth]))

;; TODO: configure `telemere` and otel
(defn init []
  (mount/start #'imigresen-common.state.db.core/db
               #'imigresen-common.state.flipt.core/flipt))

(defn destroy []
  (mount/stop #'imigresen-common.state.db.core/db
              #'imigresen-common.state.flipt.core/flipt))

(def serialize
  (m/create
   (-> m/default-options
       (assoc-in [:formats (:json content-types) :encoder-opts] {:encode-key-fn (comp ->camelCase name) :strip-nils true}) ;; clojure -> json
       (assoc-in [:formats (:json content-types) :decoder-opts] {:decode-key-fn (comp keyword ->kebab-case)})))) ;; json -> clojure

(def exception-middleware
  (reitit.ring.middleware.exception/create-exception-middleware
   (merge reitit.ring.middleware.exception/default-handlers
          {;; TODO: not matching against this for some reason
           ::bauth/unauthorized (constantly (status (:unauthorized status-codes)))
           ::exception/default (fn [e _request]
                                 {:status (:internal-server-error status-codes)
                                  :body {:message (ex-message e)
                                         :exception (.getClass e)
                                         :data (ex-data e)}})
           ::exception/wrap (fn [handler e request]
                              ;; TODO: go through logger
                              (println "ERROR" (ex-message e) (ex-cause e) (ex-data e) (pr-str (:uri request)))
                              (handler e request))})))

(def app
  (with-authnz (ring-handler
                (router (handlers) {:exception reitit.dev.pretty/exception
                                    :data {:coercion reitit.coercion.spec/coercion
                                           :muuntaja serialize
                                           :middleware [reitit.swagger/swagger-feature ;; swagger feature 
                                                        reitit.ring.middleware.parameters/parameters-middleware ;; query-params & form-params
                                                        reitit.ring.middleware.muuntaja/format-negotiate-middleware ;; content-negotiation
                                                        reitit.ring.middleware.muuntaja/format-response-middleware ;; encoding response body
                                                        exception-middleware ;; exception handling
                                                        reitit.ring.middleware.muuntaja/format-request-middleware ;; decoding request body
                                                        reitit.ring.coercion/coerce-response-middleware ;; coercing response body
                                                        reitit.ring.coercion/coerce-request-middleware ;; coercing request parameters
                                                        reitit.ring.middleware.multipart/multipart-middleware ;; multipart
                                                        cors-middleware ;; cors
                                                        ;; query string
                                                        query-string-middleware]}})

                (routes (redirect-trailing-slash-handler)
                        (create-swagger-ui-handler
                         {:path "/docs"
                          :config {:validatorUrl nil
                                   :urls [{:name "swagger" :url "/swagger.json"}]
                                   :urls.primaryName "swagger"
                                   :operationsSorter "alpha"
                                   :showRequestHeaders true
                                   :jsonEditor true}})
                        (create-default-handler)))))
