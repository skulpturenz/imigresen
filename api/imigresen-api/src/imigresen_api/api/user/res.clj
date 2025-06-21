(ns imigresen-api.api.user.res
  (:require  [ring.util.response :refer [created response status]]
             [imigresen-api.app.routes :refer [status-codes]]))

(defn GET [user]
  (-> (response user)
      (status (:ok status-codes))))

(defn POST [user]
  (-> (created user)))

(defn PATCH [user]
  (-> (response user)
      (status (:ok status-codes))))

(defn DELETE [_user]
  (-> (status (:no-content status-codes))))
