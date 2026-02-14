(ns imigresen-api.app.core
  (:require [camel-snake-kebab.core :as csk]
            [clj-commons.format.exceptions :as pexceptions]
            [clojure.java.io :as io]
            [clojure.pprint]
            [clojure.string :as str]
            [expound.alpha :as expound]
            [imigresen-api.api.core :as imi-core]
            [imigresen-common.app.auth :as imi-auth]
            [imigresen-common.app.env :as imi-env]
            [imigresen-common.app.middleware.cors :as imi-cors]
            [imigresen-common.app.routes :as imi-routes]
            [imigresen-common.app.swagger :as imi-swagger]
            [imigresen-common.state.db.core]
            [imigresen-common.state.flipt.core]
            [imigresen-common.state.keycloak.core]
            [muuntaja.core :as m]
            [reitit.coercion]
            [reitit.coercion.spec :as reitit-coercion]
            [reitit.dev.pretty]
            [reitit.openapi :as openapi]
            [reitit.ring :as reitit-ring]
            [reitit.ring.coercion]
            [reitit.ring.middleware.exception :as reitit-exception]
            [reitit.ring.middleware.multipart]
            [reitit.ring.middleware.muuntaja :as muuntaja]
            [reitit.ring.middleware.parameters :as parameters]
            [reitit.spec :as rs]
            [reitit.swagger-ui :as reitit-swagger]
            [ring.core.protocols :as ring-protocols]
            [ring.logger :as logger]
            [ring.util.response :as ring-res]
            [sentry-clj.core :as sentry]
            [taoensso.telemere :as tel])
  (:import (java.io Writer)
           (java.util UUID)))

(defn- response-writer ^Writer [response output-stream]
  (if-let [charset (ring-res/get-charset response)]
    (io/writer output-stream :encoding charset)
    (io/writer output-stream)))

;; see: https://github.com/ring-clojure/ring/blob/1.11.0-RC1/ring-core/src/ring/core/protocols.clj#L8
(extend UUID
  ring-protocols/StreamableResponseBody
  {:write-body-to-stream (fn [body response output-stream]
                           (doto (response-writer response output-stream)
                             (.write (str body))
                             (.close)))})

(defn unauthorized-exception-handler [ex _req]
  {:status (:unauthorized imi-routes/status-codes)
   :body {:message (or (get-in (ex-data ex) [:data :message])
                       "Unauthorized")}})

(defn not-found-exception-handler [ex _req]
  {:status (:not-found imi-routes/status-codes)
   :body {:message (or (get-in (ex-data ex) [:data :message])
                       "Not found")}})

(defn bad-request-exception-handler [ex _req]
  {:status (:bad-request imi-routes/status-codes)
   :body {:message (or (get-in (ex-data ex) [:data :message])
                       "Bad request")}})

(defn bad-state-exception-handler [ex _req]
  {:status (:internal-server-error imi-routes/status-codes)
   :body {:message (or (get-in (ex-data ex) [:data :message])
                       "Bad state")}})

(defn default-exception-handler [ex _req]
  {:status (:internal-server-error imi-routes/status-codes)
   :body {:message (ex-message ex)
          :exception (class ex)
          :data (ex-data ex)}})

(defn generic-exception-handler [ex req]
  (let [data (ex-data ex)]
    (cond
      (= (get-in data [:data :type]) :not-found) (not-found-exception-handler ex req)
      (= (get-in data [:data :type]) :bad-request) (bad-request-exception-handler ex req)
      (= (get-in data [:data :type]) :bad-state) (bad-state-exception-handler ex req)
      :else (default-exception-handler ex req))))

(defn always-exception-handler [handler ex req]
  (let [formatted-ex-message (pexceptions/format-exception ex)]
    (tel/log! {:level :error
               :msg formatted-ex-message
               :data {:ex ex}})
    (sentry/send-event {:message {:message (ex-message ex)
                                  :formatted formatted-ex-message}
                        :throwable ex
                        :level :error
                        :request {:url (:uri req)
                                  :method (name (:request-method req))
                                  :query-string (:query-string req)
                                  :headers (:headers req)}}))
  (handler ex req))

(defn coercion-error-handler [status]
  (let [printer (expound/custom-printer {:theme :figwheel-theme,
                                         :print-specs? false})
        handler (reitit-exception/create-coercion-handler status)]
    (fn [exception request]
      (printer (-> exception ex-data :problems))
      (handler exception request))))

(def exception-middleware
  (reitit-exception/create-exception-middleware
   (merge reitit-exception/default-handlers
          {clojure.lang.ExceptionInfo generic-exception-handler ;; exceptions from truss otherwise default
           :not-found not-found-exception-handler
           ::imi-auth/unauthorized unauthorized-exception-handler
           ::reitit-exception/default default-exception-handler
           ::reitit-exception/wrap always-exception-handler
           :reitit.coercion/request-coercion (coercion-error-handler (:bad-request imi-routes/status-codes))
           :reitit.coercion/response-coercion (coercion-error-handler (:internal-server-error imi-routes/status-codes))})))

(defn openapi []
  ["/openapi.json" {:get {:handler (openapi/create-openapi-handler)
                          :no-doc true
                          :middleware [(imi-swagger/create-transform-middleware csk/->camelCase)]
                          :openapi {:info {:title "Imigresen"}
                                    :components {:securitySchemes
                                                 {:openIdConnect {:type "openIdConnect"
                                                                  :openIdConnectUrl "https://authnz.skulpture.xyz/realms/imigresen/.well-known/openid-configuration"}}}
                                    :servers [{:url (if (imi-env/preview? (imi-env/current-env))
                                                      (imi-env/env :buang-deployment-path string? "/")
                                                      "/")}]}}}])

(defn ping []
  ["/ping" ["" {:get {:handler (constantly (-> (ring-res/response ".")
                                               (ring-res/content-type (:plain-text imi-routes/content-types))))
                      :no-doc true}}]])

(defn redirect-preview [handler]
  (fn [req]
    (let [res (handler req)]
      (if (and (imi-env/preview? (imi-env/current-env))
               (seq (get-in res [:headers "Location"]))
               (seq (imi-env/env :buang-deployment-path string? ""))
               (not (str/includes? (get-in res [:headers "Location"]) (imi-env/env :buang-deployment-path string? ""))))
        (assoc-in res [:headers "Location"] (str (imi-env/env :buang-deployment-path string? "") (get-in res [:headers "Location"])))
        res))))

(defn create-app [handlers]
  (let [global-middleware [;; CORS
                           imi-cors/cors-middleware
                           ;; query-params & form-params
                           parameters/parameters-middleware
                           ;; authnz
                           imi-auth/with-authnz
                           ;; content type negotiation
                           ;; decoding request body (json -> clj)
                           ;; encoding response body (clj -> json)
                           muuntaja/format-middleware
                           ;; exception handling
                           exception-middleware
                           ;; camelCase res
                           (imi-routes/transform-response csk/->camelCase)
                           ;; kebab-case req
                           (imi-routes/transform-request csk/->kebab-case-keyword)
                           ;; coercing request parameters (json -> clj, correct types)
                           reitit.ring.coercion/coerce-request-middleware
                           ;; coercing response body (clj -> json, correct types)
                           reitit.ring.coercion/coerce-response-middleware
                           ;; openapi feature
                           openapi/openapi-feature
                           ;; handle redirects when deployed as preview
                           redirect-preview]
        dev-middleware []]
    (reitit-ring/ring-handler
     (reitit-ring/router
      (conj handlers (openapi) (ping))
      {:exception reitit.dev.pretty/exception
       :validate rs/validate
       :data {:coercion reitit-coercion/coercion
              :muuntaja m/instance
              :middleware (if (imi-env/local? (imi-env/current-env))
                            (into [] cat [global-middleware dev-middleware])
                            global-middleware)}})
     (redirect-preview (reitit-ring/routes (reitit-ring/redirect-trailing-slash-handler)
                                           (reitit-swagger/create-swagger-ui-handler
                                            {:path "/docs"
                                             :config {:validatorUrl nil
                                                      :urls [{:name "openapi"
                                                              :url (if (imi-env/preview? (imi-env/current-env))
                                                                     (str (imi-env/env :buang-deployment-path string? "") "/openapi.json")
                                                                     "/openapi.json")}]
                                                      :urls.primaryName "openapi"
                                                      :operationsSorter "alpha"
                                                      :showRequestHeaders true
                                                      :jsonEditor true}})
                                           (reitit-ring/create-default-handler))))))

(def app (logger/wrap-with-logger (create-app (imi-core/handlers))
                                  {:log-fn (fn [{:keys [level throwable message]}]
                                             (tel/log! {:level level
                                                        :data {:details message
                                                               :ex throwable}}))}))
