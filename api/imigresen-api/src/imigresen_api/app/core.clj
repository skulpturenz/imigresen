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
            [mount.core :as mount]
            [imigresen-api.api.core :as imi-core]
            [imigresen-common.state.db.core]
            [imigresen-common.state.flipt.core]
            [imigresen-common.app.routes :as imi-routes]
            [imigresen-common.app.auth :as imi-auth]
            [ring.util.response :as ring-res]
            [expound.alpha :as expound]
            [imigresen-common.app.env :as imi-env]
            [muuntaja.core :as m]
            [camel-snake-kebab.core :as csk]
            [imigresen-common.app.swagger :as imi-swagger]
            [imigresen-common.app.logging :as imi-logging]
            [clj-commons.format.exceptions :as pexceptions]
            [taoensso.telemere :as tel]
            [sentry-clj.core :as sentry]
            [reitit.spec :as rs]
            [ring.core.protocols :as ring-protocols]
            [imigresen-common.app.middleware.cors :as imi-cors]
            [clojure.java.io :as io]
            [imigresen-common.state.keycloak.core]
            [ring.logger :as logger]
            [clj-reload.core :as reload]
            [watchtower.core :as watchtower]
            [ring.adapter.jetty :as adapter]
            [nrepl.server :as nrepl]
            [cider.nrepl :as cider])
  (:import (java.util UUID)
           (java.io Writer)))

(defn init [& {:keys [unload-hook reload-hook watch-dirs] :as _opts
               :or {unload-hook 'before-ns-unload
                    reload-hook 'after-ns-reload
                    watch-dirs ["src" "checkouts" "resources"]}}]
  (imi-logging/init-logging)
  (mount/start #'imigresen-common.state.db.core/db
               #'imigresen-common.state.flipt.core/flipt
               #'imigresen-common.state.keycloak.core/keycloak)
  (when (imi-env/development? (imi-env/current-env))
    (reload/init {:output :verbose
                  :unload-hook unload-hook
                  :reload-hook reload-hook})
    (let [reload-count (atom 0)]
      (watchtower/watcher watch-dirs
                          (watchtower/rate 20)
                          (watchtower/on-change (fn [files]
                                                  (when (> @reload-count 0)
                                                    (println "files changed: " (map #(.getPath %) files)))
                                                  (reload/reload)
                                                  (swap! reload-count inc)))))))

(defn destroy []
  (mount/stop #'imigresen-common.state.db.core/db
              #'imigresen-common.state.flipt.core/flipt
              #'imigresen-common.state.keycloak.core/keycloak))

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

(def unauthorized-exception-handler (constantly (ring-res/status (:unauthorized imi-routes/status-codes))))

(def not-found-exception-handler (constantly (ring-res/status (:not-found imi-routes/status-codes))))

(defn default-exception-handler [ex _req]
  {:status (:internal-server-error imi-routes/status-codes)
   :body {:message (ex-message ex)
          :exception (class ex)
          :data (ex-data ex)}})

(defn generic-exception-handler [ex req]
  (let [data (ex-data ex)]
    (cond
      (= (get-in data [:data :type]) :not-found) (not-found-exception-handler req)
      :else (default-exception-handler ex req))))

(defn always-exception-handler [handler ex req]
  (let [formatted-ex-message (pexceptions/format-exception ex)]
    (tel/log! {:level :error :msg formatted-ex-message :data {:ex ex}})
    (sentry/send-event {:message {:message (ex-message ex) :formatted formatted-ex-message}
                        :throwable ex
                        :level :error
                        :request {:url (:uri req)
                                  :method (name (:request-method req))
                                  :query-string (:query-string req)
                                  :headers (:headers req)}}))
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
                                                                  :openIdConnectUrl "https://authnz.skulpture.xyz/realms/imigresen/.well-known/openid-configuration"}}}}}}])

(defn ping []
  ["/ping" ["" {:get {:handler (constantly (-> (ring-res/response ".")
                                               (ring-res/content-type (:plain-text imi-routes/content-types))))
                      :no-doc true}}]])

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
                           openapi/openapi-feature]
        dev-middleware []]
    (reitit-ring/ring-handler
     (reitit-ring/router
      (conj handlers (openapi) (ping))
      {:exception reitit.dev.pretty/exception
       :validate rs/validate
       :data {:coercion reitit-coercion/coercion
              :muuntaja m/instance
              :middleware (if (imi-env/development? (imi-env/current-env))
                            (into [] cat [global-middleware dev-middleware])
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

(def app (logger/wrap-with-logger (create-app (imi-core/handlers))
                                  {:log-fn (fn [{:keys [level throwable message]}]
                                             (tel/log! {:level level :data {:details message :ex throwable}}))}))

(def server (let [server (adapter/run-jetty app {:port 3000 :join? false :daemon? true})]
              (println "Listening on port 3000")
              server))

(def nrepl-server (let [server (nrepl/start-server :port 4321 :handler cider/cider-nrepl-handler)]
                    (println "nREPL server listening on 4321")
                    (spit ".nrepl-port" "4321")
                    server))

#_{:clojure-lsp/ignore [:clojure-lsp/unused-public-var]}
(defn before-ns-unload []
  (.stop server)
  (nrepl/stop-server nrepl-server))

;; from: https://github.com/MichaelBlume/ring-server/blob/master/src/ring/server/standalone.clj#L41C1-L45C16
(defmacro ^{:private true} in-thread
  "Execute the body in a new thread and return the Thread object."
  [& body]
  `(doto (Thread. (fn [] ~@body))
     (.start)))

;; from: https://github.com/MichaelBlume/ring-server/blob/master/src/ring/server/standalone.clj#L47
(defn- add-destroy-hook
  "Add a destroy hook to be executed when the server ends."
  [server destroy]
  (in-thread
   (try (.join server)
        (finally (when destroy (destroy))))))

(defn -main [& _args]
  (init)
  (add-destroy-hook server (. (Runtime/getRuntime)
                              (addShutdownHook (Thread. destroy)))))
