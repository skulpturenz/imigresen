(ns imigresen-api.api.core
  (:require [imigresen-common.app.routes :as imi-routes]
            [spec-tools.data-spec :as ds]
            [imigresen-common.components.user.store :as imi-user]
            [imigresen-common.components.user.validation :as imi-user-validation]
            [imigresen-common.app.auth :as imi-auth]))

(defn api-v1 []
  ["/api/v1" {:tags ["api.v1"]}
   ;;  ["/test/:test-path-param" {:get {:summary "test route"
   ;;                                   ;; :handler (constantly {:status (:ok imi-routes/status-codes)})
   ;;                                   :handler (fn [_] (throw (ex-info "TEST!!" {})))
   ;;                                   :parameters {:path {:test-path-param int?}
   ;;                                                :query {:test-search-param string?}}
   ;;                                   :responses {(:ok imi-routes/status-codes) {:description "Success!"
   ;;                                                                              :body {:hello string?}}
   ;;                                               (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}}
   ;;                                   ;; :middleware [imi-auth/protect] ;;
   ;;                                   }
   ;;                             :post {:summary "with body params"
   ;;                                    :handler (fn [_req]
   ;;                                               {:status (:ok imi-routes/status-codes)})
   ;;                                    ;;  :handler (fn [_] (throw (ex-info "TEST!!" {})))
   ;;                                    :parameters {:path {:test-path-param int?}
   ;;                                                 :query {(ds/opt :test-search-param) string?}
   ;;                                                 :body (ds/spec {:name ::test
   ;;                                                                 :spec {:id integer?
   ;;                                                                        (ds/opt :optional) string?
   ;;                                                                        (ds/req :required) [{:id int?}]}})}
   ;;                                    :responses {(:ok imi-routes/status-codes) {:description "Success!"
   ;;                                                                               :body {:hello string?}}
   ;;                                                (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}}}}]
   ["/user" {:get {:summary "Get user details by email"
                   :handler (fn [{:keys [parameters] :as _req}]
                              {:status (:ok imi-routes/status-codes)
                               :body (imi-user/get-user-by-email (get-in parameters [:query :email]))})
                   :parameters {:query {:email imi-user-validation/email?}}
                   :responses {(:ok imi-routes/status-codes) {:description "Ok"
                                                              :body {:uuid uuid?
                                                                     :email imi-user-validation/email?
                                                                     :first-name imi-user-validation/name?
                                                                     :last-name imi-user-validation/name?}}
                               (:bad-request imi-routes/status-codes) {:description "Bad request"}
                               (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                               (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                   :middleware [imi-auth/protect]}
             :post {:summary "Create a new user"
                    :handler (fn [{:keys [parameters] :as _req}]
                               {:status (:created imi-routes/status-codes)
                                :body (imi-user/create-user-by-email! (:body parameters))})
                    :parameters {:body (ds/spec {:name ::register
                                                 :spec {:email imi-user-validation/email?
                                                        :first-name imi-user-validation/name?
                                                        :last-name imi-user-validation/name?
                                                        :password imi-user-validation/password?}})}
                    :responses {(:created imi-routes/status-codes) {:description "Created"
                                                                    :body {:uuid uuid?
                                                                           :email imi-user-validation/email?
                                                                           :first-name imi-user-validation/name?
                                                                           :last-name imi-user-validation/name?}}
                                (:bad-request imi-routes/status-codes) {:description "Bad request"}
                                (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}}}]
   ["/user/:uuid" {:get {:summary "Get user details by UUID"
                         :handler (fn [{:keys [parameters] :as _req}]
                                    {:status (:ok imi-routes/status-codes)
                                     :body (imi-user/get-user-by-uuid (get-in parameters [:path :uuid]))})
                         :parameters {:path {:uuid uuid?}}
                         :responses {(:ok imi-routes/status-codes) {:description "Ok"
                                                                    :body {:uuid uuid?
                                                                           :email imi-user-validation/email?
                                                                           :first-name imi-user-validation/name?
                                                                           :last-name imi-user-validation/name?}}
                                     (:bad-request imi-routes/status-codes) {:description "Bad request"}
                                     (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}
                                     (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}
                         :middleware [imi-auth/protect]}}]])

(defn handlers []
  [(api-v1)])
