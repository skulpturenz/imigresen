(ns imigresen-api.api.v1.personal-details
  (:require [imigresen-common.app.routes :as imi-routes]
            [spec-tools.data-spec :as ds]
            [imigresen-common.components.user.store :as imi-user]
            [imigresen-common.components.user.spec :as imi-user-spec]
            [imigresen-common.app.auth :as imi-auth]
            [ring.util.response :as ring-res]
            [imigresen-common.components.personal-details.store :as imi-personal-details]
            [imigresen-common.components.personal-details.spec :as imi-personal-details-spec]
            [taoensso.truss :as truss]))

(defn personal-details []
  ["/personal-details" {:tags ["personal-details.v1"]}
   ["/:user-uuid" {:put {:summary "Update personal details by user UUID"
                         :handler (fn [{:keys [identity parameters] :as _req}]
                                    (-> (:body parameters)
                                        (assoc :user-uuid
                                               (truss/have imi-user/active-by-uuid? (get-in parameters [:path :user-uuid])))
                                        ((partial imi-personal-details/upsert-by-user-uuid! identity)))
                                    (-> (ring-res/response nil)
                                        (ring-res/status (:no-content imi-routes/status-codes))))
                         :parameters {:path {:user-uuid ::imi-user-spec/uuid}
                                      :body (ds/spec {:name ::put-user-personal-details
                                                      :spec imi-personal-details-spec/personal-details})}
                         :responses {(:no-content imi-routes/status-codes) {:description "No content"}
                                     (:bad-request imi-routes/status-codes) {:description "Bad request"}
                                     (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                                     (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                         :middleware [imi-auth/protect]}}]])
