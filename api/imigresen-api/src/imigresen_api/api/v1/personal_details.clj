(ns imigresen-api.api.v1.personal-details
  (:require [imigresen-common.app.auth :as imi-auth]
            [imigresen-common.app.routes :as imi-routes]
            [imigresen-common.components.personal-details.spec :as imi-pd-spec]
            [imigresen-common.components.personal-details.store :as imi-pd]
            [imigresen-common.components.user.spec :as imi-user-spec]
            [imigresen-common.components.user.store :as imi-user]
            [ring.util.response :as ring-res]
            [spec-tools.data-spec :as ds]
            [taoensso.truss :as truss]))

(defn personal-details-routes []
  ["/personal-details" {:tags ["personal-details.v1"]}
   ["/user/:user-uuid"
    ["" {:get {:summary "Get personal details by user UUID"
               :handler (fn [{:keys [parameters]
                              :as _req}]
                          (-> (truss/have imi-user/active-by-uuid? (get-in parameters [:path :user-uuid]) :data {:type :not-found})
                              (imi-pd/get-personal-details-by-user-uuid)
                              (ring-res/response)
                              (ring-res/status (:ok imi-routes/status-codes))))
               :parameters {:path {:user-uuid ::imi-user-spec/uuid}}
               :responses {(:ok imi-routes/status-codes) {:description "Ok"
                                                          :body (ds/spec imi-pd-spec/personal-details)}
                           (:not-found imi-routes/status-codes) {:description "Not found"}
                           (:bad-request imi-routes/status-codes) {:description "Bad request"}
                           (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                           (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
               :middleware [imi-auth/protect]}
         :put {:summary "Update personal details by user UUID"
               :handler (fn [{:keys [identity parameters]
                              :as _req}]
                          (-> (:body parameters)
                              (assoc :user-uuid
                                     (truss/have imi-user/active-by-uuid? (get-in parameters [:path :user-uuid])) :data {:type :not-found})
                              ((partial imi-pd/upsert-by-user-uuid! identity))
                              (truss/have))
                          (-> (ring-res/response nil)
                              (ring-res/status (:no-content imi-routes/status-codes))))
               :parameters {:path {:user-uuid ::imi-user-spec/uuid}
                            :body (ds/spec {:name ::put-user-personal-details
                                            :spec (-> imi-pd-spec/personal-details
                                                      (update-in [:spec] dissoc :uuid)
                                                      (assoc :name ::put-personal-details)
                                                      (ds/spec))})}
               :responses {(:no-content imi-routes/status-codes) {:description "No content"}
                           (:not-found imi-routes/status-codes) {:description "Not found"}
                           (:bad-request imi-routes/status-codes) {:description "Bad request"}
                           (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                           (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
               :middleware [imi-auth/protect]}}]]])
