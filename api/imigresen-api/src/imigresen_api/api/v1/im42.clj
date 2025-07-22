(ns imigresen-api.api.v1.im42
  (:require [imigresen-common.app.routes :as imi-routes]
            [spec-tools.data-spec :as ds]
            [imigresen-common.app.auth :as imi-auth]
            [ring.util.response :as ring-res]
            [imigresen-common.components.im42-form.store :as imi-im42]
            [imigresen-common.components.im42-form.spec :as imi-im42-spec]
            [taoensso.truss :as truss]
            [imigresen-common.components.user.store :as imi-user]))

(defn im42-routes []
  ["/im42" {:tags ["im42.v1"]}
   ["/synced/:user-uuid" {:put {:summary "Mark a user as synced"
                                :handler (fn [{:keys [identity parameters] :as _req}]
                                           (-> (imi-im42/synced!
                                                identity (truss/have imi-user/active-by-uuid?
                                                                     (get-in parameters [:path :user-uuid])
                                                                     :data {:type :not-found}))
                                               (ring-res/response)
                                               (ring-res/status (:ok imi-routes/status-codes))))
                                :parameters {:path {:user-uuid ::imi-im42-spec/uuid}}
                                :responses {(:no-content imi-routes/status-codes) {:description "No content"
                                                                                   :body vector?}
                                            (:not-found imi-routes/status-codes) {:description "Not found"}
                                            (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                                            (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                                :middleware [imi-auth/protect]}}]
   ;; draft forms are stored in automerge repo until submitted
   ;; so all we store is an automerge url no data
   ["/draft/:user-uuid" {:get {:summary "Get draft IM42 forms"
                               :handler (fn [{:keys [parameters] :as _req}]
                                          (-> (imi-im42/get-draft-im42-forms-by-user-uuid
                                               (truss/have imi-user/active-by-uuid?
                                                           (get-in parameters [:path :user-uuid])
                                                           :data {:type :not-found}))
                                              (ring-res/response)
                                              (ring-res/status (:ok imi-routes/status-codes))))
                               :parameters {:path {:user-uuid ::imi-im42-spec/uuid}}
                               :responses {(:ok imi-routes/status-codes) {:description "Ok"
                                                                          :body vector?}
                                           (:not-found imi-routes/status-codes) {:description "Not found"}
                                           (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                                           (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                               :middleware [imi-auth/protect]}}]
   ["/:user-uuid" {:post {:summary "Register a new IM42 form"
                          :handler (fn [{:keys [identity parameters] :as _req}]
                                     (-> (imi-im42/register-im42-form!
                                          identity
                                          (truss/have imi-user/active-by-uuid?
                                                      (get-in parameters [:path :user-uuid])
                                                      :data {:type :not-found})
                                          (get-in parameters [:body :automerge-url]))
                                         (ring-res/response)
                                         (ring-res/content-type (:plain-text imi-routes/content-types))
                                         (ring-res/status (:created imi-routes/status-codes))))
                          :parameters {:path {:user-uuid ::imi-im42-spec/uuid}
                                       :body (ds/spec {:name ::post-register
                                                       :spec {:automerge-url ::imi-im42-spec/automerge-url}})}
                          :responses {(:created imi-routes/status-codes) {:description "Created"
                                                                          :body uuid?}
                                      (:not-found imi-routes/status-codes) {:description "Not found"}
                                      (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                                      (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                          :middleware [imi-auth/protect]}}
    ["/:uuid" {:put {:summary "Update a registered IM42 form"
                     :handler (fn [{:keys [identity parameters] :as _req}]
                                (truss/have
                                 (imi-im42/upsert-im42-form!
                                  identity
                                  (truss/have imi-user/active-by-uuid?
                                              (get-in parameters [:path :user-uuid])
                                              :data {:type :not-found})
                                  (truss/have #(imi-im42/creator-by-user-uuid? (get-in parameters [:path :user-uuid]) %)
                                              (get-in parameters [:path :uuid])
                                              :data {:type :not-found})
                                  (:body parameters)))
                                (-> (ring-res/response nil)
                                    (ring-res/status (:no-content imi-routes/status-codes))))
                     :parameters {:path {:user-uuid ::imi-im42-spec/uuid
                                         :uuid ::imi-im42-spec/uuid}
                                  :body (-> imi-im42-spec/im42-form
                                            (update-in [:spec] dissoc :uuid)
                                            (assoc :name ::put-im42-form)
                                            (ds/spec))}
                     :responses {(:no-content imi-routes/status-codes) {:description "No content"}
                                 (:not-found imi-routes/status-codes) {:description "Not found"}
                                 (:bad-request imi-routes/status-codes) {:description "Bad request"}
                                 (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                                 (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                     :middleware [imi-auth/protect]}}]]])
