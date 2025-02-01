(ns imigresen-api.components.user.store
  (:require [imigresen-api.app.kc :refer [create-kc-client-conf]]
            [keycloak.deployment :refer [keycloak-client]]
            [keycloak.user :as kcu]
            [imigresen-api.app.env :refer [env]]
            [honey.sql :as sql]
            [next.jdbc :as jdbc]
            [imigresen-api.state.db.core :refer [db]]
            [clj-uuid :as uuid]
            [java-time.api :as jt]))

;; TODO: remove default value
(def ^:private kc-client (keycloak-client (create-kc-client-conf) (env :kc-secret string? "HELLO WORLD")))

(def ^:private realm (env :kc-realm string?))

(defn- user [uuid first-name last-name email updated-at created-at]
  {:uuid uuid
   :first-name first-name
   :last-name last-name
   :email email
   :updated-at updated-at
   :created-at created-at})

(defn find-by-kc-id [kc-id]
  (let [query {:select [:kc_id :uuid :email :updated_at :created_at :deleted]
               :from [:users]
               :where [:and [:is-not true] [:= :kc_id kc-id]]}
        result (jdbc/execute-one! (:ds @db) (sql/format query))
        kc-user (kcu/get-user kc-client realm (:kc_id result))]
    (user (:uuid result) (.getFirstName kc-user) (.getLastName kc-user) (.getEmail kc-user) (:updated_at result) (:created_at result))))

(defn find-by-email [email]
  (let [query {:select [:kc_uuid :uuid :email :updated_at :created_at :deleted]
               :from [:users]
               :where [:and [:= :deleted false] [:= :email email]]}
        result (jdbc/execute-one! (:ds @db) (sql/format query))
        kc-user (kcu/get-user-by-username kc-client realm (:email result))]
    (user (:uuid result) (.getFirstName kc-user) (.getLastName kc-user) (.getEmail kc-user) (:updated_at result) (:created_at result))))

(defn unique-email? [email]
  (let [query {:select [:uuid]
               :from [:users]
               :where [:and [:= :deleted false] [:= :email email]]
               :limit 1}
        result (jdbc/execute-one! (:ds @db) (sql/format query))
        kc-unique (kcu/username-exists? kc-client realm email)]
    (and (not-empty result) (not (nil? kc-unique)))))

(defn create-user-by-email! [{:keys [email first-name last-name password]}]
  (jdbc/with-transaction [tx (:ds @db)]
    (let [kc-user (kcu/create-user! kc-client realm {:username email
                                                     :first-name first-name
                                                     :last-name last-name
                                                     :password password})
          query {:insert-into :users
                 :columns [:kc_id :uuid :email :created_at :updated_at]
                 :values [[(.getId kc-user) (uuid/v7) (.getEmail kc-user) (jt/offset-date-time) (jt/offset-date-time)]]
                 :returning [:kc_id :uuid :email :created_at :updated_at]}
          result (jdbc/execute-one! tx (sql/format query))]
      (kcu/add-required-actions! kc-client realm (.getUsername kc-user) ["VERIFY_EMAIL" "CONFIGURE_TOTP" "UPDATE_PASSWORD"])
      (user (:uuid result) (.getFirstName kc-user) (.getLastName kc-user) (:email result) (:created_at result) (:updated_at result)))))

(defn update-user-by-uuid! [{:keys [uuid first-name last-name email password]}]
  (jdbc/with-transaction [tx (:ds @db)]
    (let [query {:update :users
                 :set {:email email
                       :updated_at (jt/offset-date-time)}
                 :where [:and [:= :deleted false] [:= :uuid uuid]]
                 :returning [:kc_id :uuid :email :created_at :updated_at]}
          result (jdbc/execute-one! tx (sql/format query))
          kc-user (kcu/update-user! kc-client realm (:kc_id result) {:username email
                                                                     :first-name first-name
                                                                     :last-name last-name
                                                                     :password password})]
      (user (:uuid result) (.getFirstName kc-user) (.getLastName kc-user) (:email user) (:created_at user) (:updated_at user)))))

(defn delete-user! [uuid]
  (let [get-user-query {:select [:kc_id :email]
                        :from [:users]
                        :where [:= :uuid uuid]}
        user (first (jdbc/execute! (:ds @db) (sql/format get-user-query)))
        soft-delete-user-query! {:update :users
                                 :set {:deleted true}
                                 :where [:= :uuid uuid]
                                 :returning [:uuid :deleted]}]
    (jdbc/with-transaction [tx (:ds @db)]
      (kcu/logout-user! kc-client realm (:kc_id user))
      (kcu/delete-user! kc-client realm {:email (:email user)})
      (:deleted (jdbc/execute-one! tx (sql/format soft-delete-user-query!))))))
