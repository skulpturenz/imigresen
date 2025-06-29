(ns imigresen-api.api.core
  (:require [imigresen-common.app.routes :as imi-routes]
            [spec-tools.data-spec :as ds]
            [imigresen-api.eventing.test.events :as imi-test-eventing-events]
            [imigresen-common.eventing.handlers :as imi-eventing]))

(defn api-v1 []
  ["/api/v1" {:tags ["api.v1"]}
   ["/test/:test-path-param" {:get {:summary "test route"
                                    ;; :handler (constantly {:status (:ok imi-routes/status-codes)})
                                    :handler (fn [_] (throw (ex-info "TEST!!" {})))
                                    :parameters {:path {:test-path-param int?}
                                                 :query {:test-search-param string?}}
                                    :responses {(:ok imi-routes/status-codes) {:description "Success!"
                                                                               :body {:hello string?}}
                                                (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}}
                                    ;; :middleware [imi-auth/protect] ;;
                                    }
                              :post {:summary "with body params"
                                     :handler (fn [_req]
                                                (imi-eventing/dispatch (imi-test-eventing-events/test-event))
                                                {:status (:ok imi-routes/status-codes)
                                                 :body {:hello "WORLD!!"}})
                                     ;;  :handler (fn [_] (throw (ex-info "TEST!!" {})))
                                     :parameters {:path {:test-path-param int?}
                                                  :query {(ds/opt :test-search-param) string?}
                                                  :body (ds/spec {:name ::test
                                                                  :spec {:id integer?
                                                                         (ds/opt :optional) string?
                                                                         (ds/req :required) [{:id int?}]}})}
                                     :responses {(:ok imi-routes/status-codes) {:description "Success!"
                                                                                :body {:hello string?}}
                                                 (:unauthorized imi-routes/status-codes) {:description "Unauthorized"}}}}]])

(defn handlers []
  [(api-v1)])
