(ns imigresen-api.api.v1.im42
  (:require [clojure.spec.alpha :as s]
            [imigresen-common.app.auth :as imi-auth]
            [imigresen-common.app.routes :as imi-routes]
            [imigresen-common.components.im42-form.spec :as imi-im42-spec]
            [imigresen-common.components.im42-form.store :as imi-im42]
            [imigresen-common.components.user.store :as imi-user]
            [ring.util.response :as ring-res]
            [spec-tools.data-spec :as ds]
            [taoensso.truss :as truss]))

(defn im42-routes []
  ["/im42" {:tags ["im42.v1"]}
   ["/user/:user-uuid"
    ["" {:get {:summary "Get IM42 forms"
               :description "Returns a sorted list of IM42 application details, sort: desc time registered.
                             Filters are combined and if no filter is specified then all results for the user are returned"
               :handler (fn [{:keys [parameters]
                              :as _req}]
                          (-> (truss/have imi-user/active-by-uuid? (get-in parameters [:path :user-uuid])
                                          :data {:type :not-found})
                              (imi-im42/user->im42-forms (:query parameters) (:query parameters))
                              (ring-res/response)
                              (ring-res/status (:ok imi-routes/status-codes))))
               :parameters {:path {:user-uuid ::imi-im42-spec/uuid}
                            :query {(ds/opt :draft) boolean?
                                    (ds/opt :deleted) boolean?
                                    (ds/opt :completed) boolean?
                                    (ds/opt :issued) boolean?
                                    (ds/opt :limit) number?
                                    (ds/opt :page) number?}}
               :responses {(:ok imi-routes/status-codes) {:description "Ok"
                                                          :body (s/coll-of (-> {:name ::get-im42-form
                                                                                :status ::imi-im42-spec/status
                                                                                (ds/opt :automerge-url) ::imi-im42-spec/automerge-url
                                                                                (ds/opt :completed-at) ::imi-im42-spec/maybe-offset-date
                                                                                (ds/opt :issued-at) ::imi-im42-spec/maybe-offset-date
                                                                                (ds/opt :passport-number) ::imi-im42-spec/passport-number
                                                                                (ds/opt :personal-details) imi-im42-spec/personal-details
                                                                                (ds/opt :application-details) imi-im42-spec/application-details
                                                                                (ds/opt :address-details) imi-im42-spec/address-details
                                                                                (ds/opt :previous-documents) imi-im42-spec/previous-documents
                                                                                (ds/opt :declaration) imi-im42-spec/declaration}
                                                                               (ds/spec)))}
                           (:not-found imi-routes/status-codes) {:description "Not found"}
                           (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                           (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
               :middleware [imi-auth/protect]}
         :post {:summary "Register a new IM42 form"
                :handler (fn [{:keys [identity parameters]
                               :as _req}]
                           (truss/have #(every? empty? %)
                                       (pmap #(imi-im42/user->im42-form-ids
                                               (get-in parameters [:path :user-uuid]) %)
                                             [{:draft true}
                                              {:completed true}])
                                       :data {:type :bad-request
                                              :message (str "User" " " (get-in parameters [:path :user-uuid]) " " "has an active application")})
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
                            (:bad-request imi-routes/status-codes) {:description "Bad request"}
                            (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                            (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                :middleware [imi-auth/protect]}}]
    ["/config/synced" {:put {:summary "Mark a user as synced"
                             :handler (fn [{:keys [identity parameters]
                                            :as _req}]
                                        (imi-im42/synced! identity
                                                          (truss/have imi-user/active-by-uuid?
                                                                      (get-in parameters [:path :user-uuid])
                                                                      :data {:type :not-found}))
                                        (-> (ring-res/response nil)
                                            (ring-res/status (:no-content imi-routes/status-codes))))
                             :parameters {:path {:user-uuid ::imi-im42-spec/uuid}}
                             :responses {(:no-content imi-routes/status-codes) {:description "No content"
                                                                                :body vector?}
                                         (:not-found imi-routes/status-codes) {:description "Not found"}
                                         (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                                         (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                             :middleware [imi-auth/protect]}}]]
   ["/:uuid/user/:user-uuid" {:put {:summary "Update a registered IM42 form"
                                    :handler (fn [{:keys [identity parameters]
                                                   :as _req}]
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
                                    :middleware [imi-auth/protect]}
                              :delete {:summary "Delete a registered IM42 form"
                                       :handler (fn [{:keys [identity parameters]
                                                      :as _req}]
                                                  (truss/have
                                                   (imi-im42/delete-im42-form!
                                                    identity
                                                    (truss/have imi-user/active-by-uuid?
                                                                (get-in parameters [:path :user-uuid])
                                                                :data {:type :not-found})
                                                    (truss/have #(imi-im42/creator-by-user-uuid? (get-in parameters [:path :user-uuid]) %)
                                                                (get-in parameters [:path :uuid])
                                                                :data {:type :not-found})))
                                                  (-> (ring-res/response nil)
                                                      (ring-res/status (:no-content imi-routes/status-codes))))
                                       :parameters {:path {:user-uuid ::imi-im42-spec/uuid
                                                           :uuid ::imi-im42-spec/uuid}}
                                       :responses {(:no-content imi-routes/status-codes) {:description "No content"}
                                                   (:not-found imi-routes/status-codes) {:description "Not found"}
                                                   (:bad-request imi-routes/status-codes) {:description "Bad request"}
                                                   (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                                                   (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                                       :middleware [imi-auth/protect]}}]])
