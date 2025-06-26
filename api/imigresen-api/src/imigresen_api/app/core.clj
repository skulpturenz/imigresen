(ns imigresen-api.app.core
  (:require [reitit.ring :as reitit-ring]
            [reitit.openapi :as openapi]
            [reitit.swagger-ui :as reitit-swagger]
            [reitit.dev.pretty]
            [reitit.coercion]
            [reitit.coercion.spec :as reitit-coercion]
            [reitit.ring.middleware.parameters :as parameters]
            [reitit.ring.middleware.muuntaja :as muuntaja]
            [reitit.ring.coercion]
            [reitit.ring.middleware.exception :as reitit-exception]
            [reitit.ring.middleware.multipart]
            [ring.middleware.reload :as reload]
            [mount.core :as mount]
            [imigresen-api.api.core :as imi-core]
            [imigresen-common.state.db.core]
            [imigresen-common.state.flipt.core]
            [imigresen-common.app.routes :as imi-routes]
            [imigresen-common.app.auth :as imi-auth]
            [ring.util.response :as ring-res]
            [expound.alpha :as expound]
            [imigresen-common.app.env :as imi-env]
            [muuntaja.core :as m]))

(defn init []
  (mount/start #'imigresen-common.state.db.core/db
               #'imigresen-common.state.flipt.core/flipt))

(defn destroy []
  (mount/stop #'imigresen-common.state.db.core/db
              #'imigresen-common.state.flipt.core/flipt))

(def unauthorized-exception-handler (constantly (ring-res/status (:unauthorized imi-routes/status-codes))))

(defn default-exception-handler [ex _req]
  {:status (:internal-server-error imi-routes/status-codes)
   :body {:message (ex-message ex)
          :exception (.getClass ex)
          :data (ex-data ex)}})

(defn always-exception-handler [handler ex req]
  ;; TODO: go through proper logger
  (handler ex req))

(defn coercion-error-handler [status]
  (let [printer (expound/custom-printer {:theme :figwheel-theme, :print-specs? false})
        handler (reitit-exception/create-coercion-handler status)]
    (fn [exception request]
      (printer (-> exception ex-data :problems))
      (handler exception request))))

(def exception-middleware
  (reitit-exception/create-exception-middleware
   (merge reitit-exception/default-handlers
          {::imi-auth/unauthorized unauthorized-exception-handler
           ::reitit-exception/default default-exception-handler
           ::reitit-exception/wrap always-exception-handler
           :reitit.coercion/request-coercion (coercion-error-handler 400)
           :reitit.coercion/response-coercion (coercion-error-handler 500)})))

(def app
  (let [global-middleware [;; query-params & form-params
                           parameters/parameters-middleware
                           ;; authnz
                           imi-auth/with-authnz
                           ;; content type negotiation
                           ;; decoding request body (json -> clj)
                           ;; encoding response body (clj -> json)
                           muuntaja/format-middleware
                           ;; exception handling
                           exception-middleware
                           ;; coercing response body (clj -> json, correct types)
                           reitit.ring.coercion/coerce-response-middleware
                           ;; coercing request parameters (json -> clj, correct types)
                           reitit.ring.coercion/coerce-request-middleware
                           ;; openapi feature
                           openapi/openapi-feature]
        dev-middleware [;; reload namespaces
                        reload/wrap-reload]]
    (reitit-ring/ring-handler
     (reitit-ring/router (imi-core/handlers) {:exception reitit.dev.pretty/exception
                                              :data {:coercion reitit-coercion/coercion
                                                     :muuntaja m/instance
                                                     :middleware (if (imi-env/development? (imi-env/current-env))
                                                                   (conj global-middleware dev-middleware)
                                                                   global-middleware)}})
     (reitit-ring/routes (reitit-ring/redirect-trailing-slash-handler)
                         (reitit-swagger/create-swagger-ui-handler
                          {:path "/docs"
                           :config {:validatorUrl nil
                                    :urls [{:name "openapi" :url "/openapi.json"}]
                                    :urls.primaryName "openapi"
                                    :operationsSorter "alpha"
                                    :showRequestHeaders true
                                    :jsonEditor true}})
                         (reitit-ring/create-default-handler)))))
