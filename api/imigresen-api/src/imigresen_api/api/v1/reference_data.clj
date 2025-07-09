(ns imigresen-api.api.v1.reference-data
  (:require [imigresen-common.app.routes :as imi-routes]
            [ring.util.response :as ring-res]
            [imigresen-common.components.reference-data.im42 :as imi-rd-im42]
            [camel-snake-kebab.core :as csk]))

(defn reference-data-routes []
  ["/reference-data"
   ["/im42" {:tags ["reference-data.im42.v1"]}
    ["/countries" {:get {:summary "Get countries"
                         :handler (fn [{:keys [_parameters] :as _req}]
                                    (-> (ring-res/response (imi-rd-im42/get-countries))
                                        (ring-res/status (:ok imi-routes/status-codes))))
                         :responses {(:ok imi-routes/status-codes) {:description "Ok"
                                                                    :body seq?}
                                     (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}}
                   :middleware [(imi-routes/transform-response csk/->SCREAMING_SNAKE_CASE)]}]
    ["/genders" {:get {:summary "Get genders"
                       :handler (fn [{:keys [_parameters] :as _req}]
                                  (-> (ring-res/response (imi-rd-im42/get-genders))
                                      (ring-res/status (:ok imi-routes/status-codes))))
                       :responses {(:ok imi-routes/status-codes) {:description "Ok"
                                                                  :body seq?}
                                   (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}}
                 :middleware [(imi-routes/transform-response csk/->SCREAMING_SNAKE_CASE)]}]
    ["/relationship-statuses" {:get {:summary "Get relationship statuses"
                                     :handler (fn [{:keys [_parameters] :as _req}]
                                                (-> (ring-res/response (imi-rd-im42/get-relationship-statuses))
                                                    (ring-res/status (:ok imi-routes/status-codes))))
                                     :responses {(:ok imi-routes/status-codes) {:description "Ok"
                                                                                :body seq?}
                                                 (:internal-server-error imi-routes/status-codes) {:description "Internal server error"}}}
                               :middleware [(imi-routes/transform-response csk/->SCREAMING_SNAKE_CASE)]}]]])
