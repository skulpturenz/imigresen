(ns imigresen-api.api.core
  (:require [imigresen-common.app.routes :as imi-routes]
            [spec-tools.data-spec :as ds]
            [imigresen-common.components.user.store :as imi-user]
            [imigresen-common.components.user.spec :as imi-user-spec]
            [imigresen-common.app.auth :as imi-auth]
            [ring.util.response :as ring-res]))

(defn api-v1 []
  ["/api/v1" {:tags ["api.v1"]}
   ["/user" {:get {:summary "Get user details by email"
                   :handler (fn [{:keys [parameters] :as _req}]
                              (-> (ring-res/response (imi-user/get-user-by-email (get-in parameters [:query :email])))
                                  (ring-res/status (:ok imi-routes/status-codes))))
                   :parameters {:query {:email ::imi-user-spec/email}}
                   :responses {(:ok imi-routes/status-codes) {:description "Ok"
                                                              :body imi-user-spec/user}
                               (:bad-request imi-routes/status-codes) {:description "Bad request"}
                               (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                               (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                   :middleware [imi-auth/protect]}
             :post {:summary "Create a new user"
                    :handler (fn [{:keys [parameters] :as _req}]
                               (-> (ring-res/response (imi-user/create-user-by-email! (:body parameters)))
                                   (ring-res/status (:created imi-routes/status-codes))))
                    :parameters {:body (ds/spec {:name ::post-user
                                                 :spec {:email ::imi-user-spec/email
                                                        :first-name ::imi-user-spec/first-name
                                                        :last-name ::imi-user-spec/last-name
                                                        :password ::imi-user-spec/password}})}
                    :responses {(:created imi-routes/status-codes) {:description "Created"
                                                                    :body imi-user-spec/user}
                                (:bad-request imi-routes/status-codes) {:description "Bad request"}
                                (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}}}]
   ["/user/:uuid" {:get {:summary "Get user details by UUID"
                         :handler (fn [{:keys [parameters] :as _req}]
                                    (-> (ring-res/response (imi-user/get-user-by-uuid (get-in parameters [:path :uuid])))
                                        (ring-res/status (:ok imi-routes/status-codes))))
                         :parameters {:path {:uuid ::imi-user-spec/uuid}}
                         :responses {(:ok imi-routes/status-codes) {:description "Ok"
                                                                    :body imi-user-spec/user}
                                     (:bad-request imi-routes/status-codes) {:description "Bad request"}
                                     (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                                     (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                         :middleware [imi-auth/protect]}}]])

(defn handlers []
  [(api-v1)])
