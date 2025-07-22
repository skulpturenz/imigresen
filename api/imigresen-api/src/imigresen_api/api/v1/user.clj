(ns imigresen-api.api.v1.user
  (:require [imigresen-common.app.routes :as imi-routes]
            [spec-tools.data-spec :as ds]
            [imigresen-common.components.user.store :as imi-user]
            [imigresen-common.components.user.spec :as imi-user-spec]
            [imigresen-common.app.auth :as imi-auth]
            [ring.util.response :as ring-res]
            [taoensso.truss :as truss]
            [imigresen-common.app.env :as imi-env]
            [imigresen-common.components.im42-form.spec :as imi-im42-spec]
            [imigresen-common.components.im42-form.store :as imi-im42]))

(defn user-routes []
  [""
   ["/auth" {:tags ["auth.v1"]}
    ["/register" {:post {:summary "Register a new user"
                         :handler (fn [{:keys [parameters] :as _req}]
                                    (imi-user/create-user-by-email! (:body parameters))
                                    (ring-res/redirect (str (imi-env/env :imi-frontend-url string? "https://imigresen.skulpture.xyz") "/register-callback")
                                                       (:see-other imi-routes/status-codes)))
                         :parameters {:body (-> imi-user-spec/user
                                                (update-in [:spec] dissoc :uuid)
                                                (update-in [:spec] assoc :password ::imi-user-spec/password)
                                                (assoc :name ::register-user)
                                                (ds/spec))}
                         :responses {(:see-other imi-routes/status-codes) {:description "See other"}
                                     (:bad-request imi-routes/status-codes) {:description "Bad request"}
                                     (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}}}]]
   ["/user" {:tags ["user.v1"]}
    ["" {:get {:summary "Get user details by email"
               :handler (fn [{:keys [parameters] :as _req}]
                          (-> (ring-res/response (imi-user/get-user-by-email (get-in parameters [:query :email])))
                              (ring-res/status (:ok imi-routes/status-codes))))
               :parameters {:query {:email ::imi-user-spec/email}}
               :responses {(:ok imi-routes/status-codes) {:description "Ok"
                                                          :body (ds/spec imi-user-spec/user)}
                           (:not-found imi-routes/status-codes) {:description "Not found"}
                           (:bad-request imi-routes/status-codes) {:description "Bad request"}
                           (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                           (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
               :middleware [imi-auth/protect]}
         :post {:summary "Create a new user"
                :handler (fn [{:keys [parameters] :as _req}]
                           (-> (ring-res/response (imi-user/create-user-by-email! (:body parameters)))
                               (ring-res/status (:created imi-routes/status-codes))))
                :parameters {:body (-> imi-user-spec/user
                                       (update-in [:spec] dissoc :uuid)
                                       (update-in [:spec] assoc :password ::imi-user-spec/password)
                                       (assoc :name ::post-user)
                                       (ds/spec))}
                :responses {(:created imi-routes/status-codes) {:description "Created"
                                                                :body (ds/spec imi-user-spec/user)}
                            (:bad-request imi-routes/status-codes) {:description "Bad request"}
                            (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}}}]
    ["/:uuid"
     ["" {:get {:summary "Get user details by UUID"
                :handler (fn [{:keys [parameters] :as _req}]
                           (-> (ring-res/response (imi-user/get-user-by-uuid (get-in parameters [:path :uuid])))
                               (ring-res/status (:ok imi-routes/status-codes))))
                :parameters {:path {:uuid ::imi-user-spec/uuid}}
                :responses {(:ok imi-routes/status-codes) {:description "Ok"
                                                           :body (ds/spec imi-user-spec/user)}
                            (:not-found imi-routes/status-codes) {:description "Not found"}
                            (:bad-request imi-routes/status-codes) {:description "Bad request"}
                            (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                            (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                :middleware [imi-auth/protect]}
          :put {:summary "Update user by UUID"
                :handler (fn [{:keys [identity parameters] :as _req}]
                           (truss/have (imi-user/update-user-by-uuid! identity (get-in parameters [:path :uuid]) (:body parameters)))
                           (-> (ring-res/response nil)
                               (ring-res/status (:no-content imi-routes/status-codes))))
                :parameters {:path {:uuid ::imi-user-spec/uuid}
                             :body (-> imi-user-spec/user
                                       (update-in [:spec] dissoc :uuid)
                                       (assoc :name ::put-user)
                                       (ds/spec))}
                :responses {(:no-content imi-routes/status-codes) {:description "No content"}
                            (:not-found imi-routes/status-codes) {:description "Not found"}
                            (:bad-request imi-routes/status-codes) {:description "Bad request"}
                            (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                            (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                :middleware [imi-auth/protect]}
          :delete {:summary "Delete user by UUID"
                   :handler (fn [{:keys [identity parameters] :as _req}]
                              (truss/have (imi-user/delete-user-by-uuid! identity (get-in parameters [:path :uuid])))
                              (-> (ring-res/response nil)
                                  (ring-res/status (:no-content imi-routes/status-codes))))
                   :parameters {:path {:uuid ::imi-user-spec/uuid}}
                   :responses {(:no-content imi-routes/status-codes) {:description "No content"}
                               (:not-found imi-routes/status-codes) {:description "Not found"}
                               (:bad-request imi-routes/status-codes) {:description "Bad request"}
                               (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                               (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                   :middleware [imi-auth/protect]}}]
     ["/config/im42" {:get {:summary "Get IM42 config"
                            :handler (fn [{:keys [parameters] :as _req}]
                                       (-> (imi-im42/get-im42-config-by-user-uuid
                                            (truss/have imi-user/active-by-uuid?
                                                        (get-in parameters [:path :user-uuid])
                                                        :data {:type :not-found}))
                                           (ring-res/response)
                                           (ring-res/status (:ok imi-routes/status-codes))))
                            :parameters {:path {:uuid ::imi-user-spec/uuid}}
                            :responses {(:ok imi-routes/status-codes) {:description "Ok"
                                                                       :body imi-im42-spec/im42-config}
                                        (:not-found imi-routes/status-codes) {:description "Not found"}
                                        (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                                        (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                            :middleware [imi-auth/protect]}}]]]])
