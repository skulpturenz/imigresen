(ns imigresen-api.app.middleware.query-string
  (:require [camel-snake-kebab.core :refer [->kebab-case]]
            [camel-snake-kebab.extras :refer [transform-keys]]))

;; https://github.com/dharrigan/startrek/blob/master/src/startrek/shared/middleware/query_string.clj

(defn ^:private with-query-string
  [handler]
  (fn [request]
    (-> (update-in request [:parameters :query] #(transform-keys ->kebab-case %))
        (handler))))

(def query-string-middleware
  {:name ::query-string
   :description "Kebabifies query string parameters (in the request parameters query map)"
   :wrap with-query-string})
