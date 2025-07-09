(ns imigresen-api.api.core
  (:require [imigresen-api.api.v1.user :as imi-user-v1]
            [imigresen-api.api.v1.reference-data :as imi-reference-data-v1]))

(defn api-v1 []
  ["/api/v1" {:tags ["api.v1"]}
   (imi-user-v1/user-routes)
   (imi-reference-data-v1/reference-data-routes)])

(defn handlers []
  [(api-v1)])
