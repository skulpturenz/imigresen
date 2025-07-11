(ns imigresen-api.api.v1.im42
  (:require [imigresen-common.app.routes :as imi-routes]
            [spec-tools.data-spec :as ds]
            [imigresen-common.app.auth :as imi-auth]
            [ring.util.response :as ring-res]
            [imigresen-common.components.im42-form.store :as imi-im42]
            [imigresen-common.components.im42-form.spec :as imi-im42-spec]
            [taoensso.truss :as truss]))

(defn im42-routes []
  ["/im42" {:tags ["im42.v1"]}
   ["" {:post {:summary "Register a new IM42 form"
               :handler (fn [{:keys [identity] :as _req}]
                          (-> (ring-res/response (imi-im42/register-im42-form! identity))
                              (ring-res/content-type (:plain-text imi-routes/content-types))
                              (ring-res/status (:created imi-routes/status-codes))))
               :parameters {:path {:uuid ::imi-im42-spec/uuid}}
               :responses {(:ok imi-routes/status-codes) {:description "Ok"
                                                          :body uuid?}
                           (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                           (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
               :middleware [imi-auth/protect]}}]
   ["/:uuid" {:put {:summary "Update a registered IM42 form"
                    :handler (fn [{:keys [identity parameters] :as _req}]
                               (truss/have (imi-im42/upsert-im42-form! identity (get-in parameters [:path :uuid]) (:body parameters)))
                               (-> (ring-res/response nil)
                                   (ring-res/status (:no-content imi-routes/status-codes))))
                    :parameters {:path {:uuid ::imi-im42-spec/uuid}
                                 :body (-> imi-im42-spec/im42-form
                                           (update-in [:spec] dissoc :uuid)
                                           (assoc :name ::put-im42-form)
                                           (ds/spec))}
                    :responses {(:no-content imi-routes/status-codes) {:description "No content"}
                                (:not-found imi-routes/status-codes) {:description "Not found"}
                                (:bad-request imi-routes/status-codes) {:description "Bad request"}
                                (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                                (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                    :middleware [imi-auth/protect]}}]])
