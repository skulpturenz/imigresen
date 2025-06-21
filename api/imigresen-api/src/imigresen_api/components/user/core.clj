(ns imigresen-api.components.user.core
  (:require [reitit.ring]
            [imigresen-api.app.routes :refer [status-codes]]))

(defn login [deps kc-id]
  (let [find-by-kc-id (:find-by-kc-id deps)
        user (find-by-kc-id kc-id)]
    (if (nil? (:uuid user))
      (throw (ex-info "user does not exist" {:type :reitit.ring/response
                                             :response (:status (:not-found status-codes))}))
      user)))

(defn register! [deps user]
  (let [create-user-by-email! (:create-user-by-email! deps)
        unique-email? (:unique-email? deps)]
    (if (not (unique-email? (:email user)))
      (throw (ex-info "active user exists" {:type :reitit.ring/response
                                            :response {:status (:bad-request status-codes)}}))
      (create-user-by-email! user))))

(defn update-user! [deps user]
  (let [update-user-by-uuid! (:update-user-by-uuid! deps)]
    (update-user-by-uuid! user)))

(defn delete! [deps uuid]
  (let [delete-user! (:delete-user! deps)]
    (delete-user! uuid)))
