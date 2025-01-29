(ns imigresen-api.components.user.store
  (:require [imigresen-api.app.kc :refer [create-keycloak-deployment]]
            [keycloak.deployment :refer [keycloak-client]]
            [keycloak.user :as kcu]
            [imigresen-api.app.env :refer [env]]
            [honey.sql :as sql]
            [next.jdbc :as jdbc]
            [imigresen-api.state.db.core :refer [db]]))

;; TODO: users table

(def kc-client (keycloak-client (create-keycloak-deployment) (env :kc-secret string?)))

(def ^:private realm (env :kc-realm string?))

(defn find-by-uuid [uuid]
  (let [query {:select [:kc_id :uuid]
               :from [:users]
               :where [:and [:not= :users.deleted false] [:= :users.uuid uuid]]}
        results (jdbc/execute! (:ds @db) (sql/format query))
        kc-user (kcu/get-user kc-client realm (:kc_id (first results)))]
    kc-user)) ;; TODO

(defn find-by-email [email]
  (let [query {:select [:kc_uuid :uuid :email]
               :from [:users]
               :where [:and [:not= :users.deleted false] [:= :users.email email]]}
        results (jdbc/execute! (:ds @db) (sql/format query))
        kc-user (kcu/get-user-by-username kc-client realm (:email (first results)))]
    kc-user)) ;; TODO

(defn unique-email? [email]
  (let [query {:select [:uuid]
               :from [:users]
               :where [:and [:= :users.deleted false] [:= :users.email email]]}
        results (jdbc/execute! (:ds @db) (sql/format query))
        kc-unique (kcu/username-exists? kc-client realm email)]
    (and (not-empty results) (not (nil? kc-unique)))))

;; TODO
(defn create-user-by-email! [{:keys [email first-name last-name password]}]
  (when (unique-email? email)
    (jdbc/with-transaction [tx (:ds @db)]
      (let [kc-user (kcu/create-user! kc-client realm {:username email
                                                       :first-name first-name
                                                       :last-name last-name
                                                       :password password})
            query {:insert-into :users
                   :columns [:kc_id :uuid :email :created_at :updated_at]
                   :values [[]] ;; TODO
                   :returning [:kc_id :uuid :email :created_at :updated_at]}
            results (jdbc/execute! tx (sql/format query))]
        (kcu/add-required-actions! kc-client realm (.getUsername kc-user) ["VERIFY_EMAIL" "CONFIGURE_TOTP" "UPDATE_PASSWORD"])
        kc-user))))

(defn delete-user! [uuid]
  (let [get {:select [:kc_id :email]
             :from [:users]
             :where [:= :users.uuid uuid]}
        user (first (jdbc/execute! (:ds @db) (sql/format get)))
        soft-delete-user-query {:update :users
                                :set {:deleted true}
                                :where [:= :users.uuid uuid]
                                :returning [:uuid :deleted]}]
    (jdbc/with-transaction [tx (:ds @db)]
      (kcu/logout-user! kc-client realm (:kc_id user))
      (kcu/delete-user! kc-client realm {:email (:email user)})
      (jdbc/execute! tx (sql/format soft-delete-user-query)))))
