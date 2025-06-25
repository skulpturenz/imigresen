(ns imigresen-api.app.core
  (:require [reitit.ring :refer [redirect-trailing-slash-handler ring-handler router routes create-default-handler]]
            [reitit.swagger]
            [reitit.swagger-ui :refer [create-swagger-ui-handler]]
            [reitit.dev.pretty]
            [reitit.coercion.spec]
            [reitit.ring.middleware.parameters]
            [reitit.ring.middleware.muuntaja]
            [reitit.ring.coercion]
            [reitit.ring.middleware.exception :refer [create-coercion-handler]]
            [muuntaja.core :as m]
            [reitit.ring.middleware.multipart]
            [mount.core :as mount]
            [imigresen-api.api.core :refer [handlers]]
            [imigresen-common.state.db.core]
            [imigresen-common.state.flipt.core]
            [camel-snake-kebab.core :refer [->camelCase ->kebab-case]]
            [imigresen-common.app.routes :refer [content-types status-codes]]
            [imigresen-common.app.auth :refer [with-authnz]]
            [imigresen-common.app.middleware.cors :refer [cors-middleware]]
            [imigresen-common.app.middleware.query-string :refer [query-string-middleware]]
            [ring.util.response :refer [status]]
            [expound.alpha :refer [custom-printer]]))

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

(def unauthorized-exception-handler (constantly (status (:unauthorized status-codes))))

(defn default-exception-handler [ex _req]
  {:status (:internal-server-error status-codes)
   :body {:message (ex-message ex)
          :exception (.getClass ex)
          :data (ex-data ex)}})

(defn always-exception-handler [handler ex req]
  ;; TODO: go through proper logger
  (println "ERROR" (ex-message ex) (ex-cause ex) (ex-data ex) (pr-str (:uri req)))
  (handler ex req))

(defn coercion-error-handler [status]
  (let [printer (custom-printer {:theme :figwheel-theme, :print-specs? false})
        handler (create-coercion-handler status)]
    (fn [exception request]
      (printer (-> exception ex-data :problems))
      (handler exception request))))

(def exception-middleware
  (reitit.ring.middleware.exception/create-exception-middleware
   (merge reitit.ring.middleware.exception/default-handlers
          {:imigresen-common.app.auth/unauthorized unauthorized-exception-handler
           :reitit.ring.middleware.exception/default default-exception-handler
           :reitit.ring.middleware.exception/wrap always-exception-handler
           :reitit.coercion/request-coercion (coercion-error-handler 400)
           :reitit.coercion/response-coercion (coercion-error-handler 500)})))

(def app
  (with-authnz (ring-handler
                (router (handlers) {:exception reitit.dev.pretty/exception
                                    :data {:coercion reitit.coercion.spec/coercion
                                           :muuntaja serialize
                                           :middleware [exception-middleware ;; exception handling
                                                        cors-middleware ;; cors
                                                        reitit.ring.coercion/coerce-request-middleware ;; coercing request parameters
                                                        reitit.ring.middleware.multipart/multipart-middleware ;; multipart
                                                        reitit.ring.middleware.parameters/parameters-middleware ;; query-params & form-params
                                                        query-string-middleware ;; query string
                                                        reitit.swagger/swagger-feature ;; swagger feature 
                                                        reitit.ring.coercion/coerce-response-middleware ;; coercing response body
                                                        reitit.ring.middleware.muuntaja/format-negotiate-middleware ;; content-negotiation
                                                        reitit.ring.middleware.muuntaja/format-response-middleware ;; encoding response body
                                                        reitit.ring.middleware.muuntaja/format-request-middleware ;; decoding request body
                                                        ]}})

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
