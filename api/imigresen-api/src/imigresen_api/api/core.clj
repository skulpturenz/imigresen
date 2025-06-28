(ns imigresen-api.api.core
  (:require [imigresen-common.app.routes :as imi-routes]))

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
                                    }}]])

(defn handlers []
  [(api-v1)])
