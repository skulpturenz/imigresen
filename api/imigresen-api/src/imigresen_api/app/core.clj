(ns imigresen-api.app.core
  (:require [reitit.ring :as reitit-ring]
            [reitit.swagger]
            [reitit.swagger-ui :as reitit-swagger]
            [reitit.dev.pretty]
            [reitit.coercion.spec]
            [reitit.ring.middleware.parameters]
            [reitit.ring.middleware.muuntaja]
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
            [expound.alpha :as expound]))

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
  (reitit.ring.middleware.exception/create-exception-middleware
   (merge reitit.ring.middleware.exception/default-handlers
          {:imigresen-common.app.auth/unauthorized unauthorized-exception-handler
           :reitit.ring.middleware.exception/default default-exception-handler
           :reitit.ring.middleware.exception/wrap always-exception-handler
           :reitit.coercion/request-coercion (coercion-error-handler 400)
           :reitit.coercion/response-coercion (coercion-error-handler 500)})))

(def app
  (imi-auth/with-authnz (reitit-ring/ring-handler
                         (reitit-ring/router (imi-core/handlers) {:exception reitit.dev.pretty/exception
                                                                  :data {:middleware [exception-middleware ;; exception handling
                                                                                      ]}})

                         (reitit-ring/routes (reitit-ring/redirect-trailing-slash-handler)
                                             (reitit-swagger/create-swagger-ui-handler
                                              {:path "/docs"
                                               :config {:validatorUrl nil
                                                        :urls [{:name "swagger" :url "/swagger.json"}]
                                                        :urls.primaryName "swagger"
                                                        :operationsSorter "alpha"
                                                        :showRequestHeaders true
                                                        :jsonEditor true}})
                                             (reitit-ring/create-default-handler)))))
