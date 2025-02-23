(ns imigresen-api.components.user.store
  (:require [imigresen-api.app.kc :refer [create-kc-client-conf]]
            [keycloak.deployment :refer [keycloak-client]]
            [keycloak.user :as kcu]
            [imigresen-api.app.env :refer [env]]
            [honey.sql :as sql]
            [next.jdbc :as jdbc]
            [imigresen-api.state.db.core :refer [db]]
            [clj-uuid :as uuid]
            [imigresen-api.components.user.spec :as s]
            [java-time.api :as jt]))

(def ^:private kc-client (keycloak-client (create-kc-client-conf) (env :kc-oauth-client-secret string?)))

(def ^:private realm (env :kc-realm string?))

(defn find-by-kc-id [kc-id]
  (let [query {:select [:kc_id :uuid :email :updated_at :created_at :deleted_at]
               :from [:users]
               :where [:and [:= :deleted_at nil] [:= :kc_id kc-id]]}
        result (jdbc/execute-one! (:ds-opts @db) (sql/format query))
        kc-user (kcu/get-user kc-client realm (:users/kc-id result))]
    (when (not (nil? result))
      (s/user
       (:users/uuid result)
       (.getFirstName kc-user)
       (.getLastName kc-user)
       (.getEmail kc-user)
       (:users/updated-at result)
       (:users/created-at result)))))

(defn find-by-email [email]
  (let [query {:select [:kc_id :uuid :email :updated_at :created_at :deleted_at]
               :from [:users]
               :where [:and [:= :deleted_at nil] [:= :email email]]}
        result (jdbc/execute-one! (:ds-opts @db) (sql/format query))
        kc-user (kcu/get-user-by-username kc-client realm (:users/email result))]
    (when (not (nil? result))
      (s/user
       (:users/uuid result)
       (.getFirstName kc-user)
       (.getLastName kc-user)
       (.getEmail kc-user)
       (:users/updated-at result)
       (:users/created-at result)))))

(defn unique-email? [email]
  (let [query {:select [:uuid]
               :from [:users]
               :where [:and [:= :deleted_at nil] [:= :email email]]
               :limit 1}
        result (jdbc/execute-one! (:ds-opts @db) (sql/format query))
        kc-unique (kcu/username-exists? kc-client realm email)]
    (and (empty? result) kc-unique)))

(defn create-user-by-email! [{:keys [email first-name last-name password] :as user}]
  (jdbc/with-transaction+options [tx (:ds-opts @db)]
    (let [personal-details (apply dissoc user [:email :first-name :last-name :password])
          kc-user (kcu/create-user! kc-client realm {:username email
                                                     :first-name first-name
                                                     :last-name last-name
                                                     :password password})
          create-user-query! {:insert-into :users
                              :columns [:kc_id :uuid :email]
                              :values [[(.getId kc-user) (uuid/v7) (.getEmail kc-user)]]
                              :returning [:uuid :created_at :updated_at]}
          created-user (jdbc/execute-one! tx (sql/format create-user-query!))
          create-personal-details-query! {:insert-into :personal_details
                                          :columns (keys personal-details)
                                          :values (vals personal-details)
                                          :returning [:uuid]}
          _created-personal-details (when (seq personal-details) (jdbc/execute-one! tx (sql/format create-personal-details-query!)))]
      (kcu/add-required-actions! kc-client realm (.getUsername kc-user) ["VERIFY_EMAIL" "CONFIGURE_TOTP" "UPDATE_PASSWORD"])
      (s/user
       (:users/uuid created-user)
       (.getFirstName kc-user)
       (.getLastName kc-user)
       (.getEmail kc-user)
       (:users/created-at created-user)
       (:users/updated-at created-user)))))

(defn update-user-by-uuid! [{:keys [uuid first-name last-name email password] :as user}]
  (jdbc/with-transaction+options [tx (:ds-opts @db)]
    (let [;; personal-details (apply dissoc user [:uuid :first-name :last-name :email :password])
          columns [:kc_id :uuid :email :created_at :updated_at]
          filters [:and [:= :deleted_at nil] [:= :uuid uuid]]
          update-user-query! (if (not (nil? email))
                               {:update :users
                                :set {:email email}
                                :where filters
                                :returning columns}
                               {:select columns
                                :from [:users]
                                :where filters})
          ;; TODO
          ;; update-personal-details-query! {:update :users
          ;;                                 :set personal-details
          ;;                                 :where [:= :user uuid]
          ;;                                 :returning [:uuid]}
          result (jdbc/execute-one! tx (sql/format update-user-query!))
          ;; TODO
          ;; _updated-personal-details (jdbc/execute-one! tx (sql/format update-personal-details-query!))
          kc-user (kcu/update-user! kc-client realm (:kc_id result) {:username email
                                                                     :first-name first-name
                                                                     :last-name last-name
                                                                     :password password})]
      (when (not (nil? result))
        (s/user
         (:users/uuid result)
         (.getFirstName kc-user)
         (.getLastName kc-user)
         (.getEmail kc-user)
         (:users/created-at result)
         (:users/updated-at result))))))

(defn delete-user! [uuid]
  (let [filters [:and [:= :deleted_at nil] [:= :uuid uuid]]
        get-user-query {:select [:kc_id :email]
                        :from [:users]
                        :where filters}
        result (jdbc/execute-one! (:ds-opts @db) (sql/format get-user-query))
        soft-delete-user-query! {:update :users
                                 :set {:deleted_at (jt/offset-date-time)}
                                 :where filters
                                 :returning [:deleted_at]}]
    (when result
      (jdbc/with-transaction+options [tx (:ds-opts @db)]
        (kcu/logout-user! kc-client realm (:users/kc_id result))
        (kcu/delete-user! kc-client realm {:users/email (:email result)})
        (:users/deleted-at (jdbc/execute-one! tx (sql/format soft-delete-user-query!)))))))
