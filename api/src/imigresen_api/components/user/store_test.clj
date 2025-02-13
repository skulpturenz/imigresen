(ns imigresen-api.components.user.store-test
  (:require [clojure.test :as t]
            [keycloak.user :as kcu]
            [imigresen-api.components.user.store :as store]
            [mount.core :as mount]
            [imigresen-api.state.db.mock :as db-mock]
            [imigresen-api.state.db.core]
            [java-time.api :as jt])
  (:import [org.keycloak.representations.idm UserRepresentation]))

(defn fixture [f]
  (mount/start #'imigresen-api.state.db.mock/db)
  (mount/start-with {#'imigresen-api.state.db.core/db imigresen-api.state.db.mock/db})
  (f)
  (mount/stop))

(t/use-fixtures :once fixture)

(t/deftest ?find-by-kc-id
  (t/testing "returns user"
    (let [user (doto (UserRepresentation.)
                 (.setId (str (random-uuid)))
                 (.setFirstName "Hello")
                 (.setLastName "World")
                 (.setEmail (str (random-uuid) "@world.com")))]
      (with-redefs [kcu/get-user (constantly user)
                    kcu/create-user! (constantly user)
                    kcu/add-required-actions! (constantly nil)]
        (let [_ (store/create-user-by-email! {:email (.getEmail user)
                                              :first-name "Hello"
                                              :last-name "World"
                                              :password "Test1234"})
              result (store/find-by-kc-id (.getId user))]
          (t/is (= 0 (jt/time-between (:created-at result) (jt/offset-date-time) :seconds)))))))
  (t/testing "returns nil otherwise"
    (with-redefs [kcu/get-user (constantly nil)
                  kcu/create-user! (constantly nil)
                  kcu/add-required-actions! (constantly nil)]
      (let [result (store/find-by-kc-id (str (random-uuid)))]
        (t/is (nil? result))))))

(t/deftest ?find-by-email
  (t/testing "returns user"
    (let [user (doto (UserRepresentation.)
                 (.setId (str (random-uuid)))
                 (.setFirstName "Hello")
                 (.setLastName "World")
                 (.setEmail (str (random-uuid) "@world.com")))]
      (with-redefs [kcu/get-user-by-username (constantly user)
                    kcu/create-user! (constantly user)
                    kcu/add-required-actions! (constantly nil)]
        (let [_ (store/create-user-by-email! {:email (.getEmail user)
                                              :first-name "Hello"
                                              :last-name "World"
                                              :password "Test1234"})
              result (store/find-by-email (.getEmail user))]
          (t/is (= 0 (jt/time-between (:created-at result) (jt/offset-date-time) :seconds)))))))
  (t/testing "returns empty map otherwise"
    (let [user (doto (UserRepresentation.)
                 (.setId (str (random-uuid)))
                 (.setFirstName "Hello")
                 (.setLastName "World")
                 (.setEmail (str (random-uuid) "@world.com")))]
      (with-redefs [kcu/get-user-by-username (constantly user)
                    kcu/create-user! (constantly nil)
                    kcu/add-required-actions! (constantly nil)]
        (let [result (store/find-by-email (str (random-uuid) "@world.com"))]
          (t/is (nil? result)))))))

(t/deftest ?unique-email?
  (t/testing "true if no active user"
    (let [user (doto (UserRepresentation.)
                 (.setId (str (random-uuid)))
                 (.setFirstName "Hello")
                 (.setLastName "World")
                 (.setEmail (str (random-uuid) "@world.com")))]
      (with-redefs [kcu/username-exists? (constantly true)
                    kcu/create-user! (constantly user)
                    kcu/add-required-actions! (constantly nil)]
        (let [_ (store/create-user-by-email! {:email (.getEmail user)
                                              :first-name "Hello"
                                              :last-name "World"
                                              :password "Test1234"})
              result (store/unique-email? (str (random-uuid) "@world.com"))]
          (t/is (true? result))))))
  (t/testing "false if active user"
    (let [user (doto (UserRepresentation.)
                 (.setId (str (random-uuid)))
                 (.setFirstName "Hello")
                 (.setLastName "World")
                 (.setEmail (str (random-uuid) "@world.com")))]
      (with-redefs [kcu/username-exists? (constantly true)
                    kcu/create-user! (constantly user)
                    kcu/add-required-actions! (constantly nil)]
        (let [_ (store/create-user-by-email! {:email (.getEmail user)
                                              :first-name "Hello"
                                              :last-name "World"
                                              :password "Test1234"})
              result (store/unique-email? (.getEmail user))]
          (t/is (false? result)))))))

(t/deftest ?create-user-by-email!
  (t/testing "creates user"
    (let [user (doto (UserRepresentation.)
                 (.setId (str (random-uuid)))
                 (.setFirstName "Hello")
                 (.setLastName "World")
                 (.setEmail (str (random-uuid) "@world.com")))]
      (with-redefs [kcu/get-user (constantly user)
                    kcu/create-user! (constantly user)
                    kcu/add-required-actions! (constantly nil)]
        (let [result (store/create-user-by-email! {:email (.getEmail user)
                                                   :first-name "Hello"
                                                   :last-name "World"
                                                   :password "Test1234"})]
          (t/is (= 0 (jt/time-between (:created-at result) (jt/offset-date-time) :seconds))))))))

(t/deftest ?update-user-by-uuid!
  (t/testing "updates user if exists and returns"
    (let [user (doto (UserRepresentation.)
                 (.setId (str (random-uuid)))
                 (.setFirstName "Hello")
                 (.setLastName "World")
                 (.setEmail (str (random-uuid) "@world.com")))]
      (with-redefs [kcu/get-user (constantly user)
                    kcu/create-user! (constantly user)
                    kcu/update-user! (constantly user)
                    kcu/add-required-actions! (constantly nil)]
        (let [created-user (store/create-user-by-email! {:email (.getEmail user)
                                                         :first-name "Hello"
                                                         :last-name "World"
                                                         :password "Test1234"})
              result (store/update-user-by-uuid! {:uuid (:uuid created-user) :email (str (random-uuid) "@world.com")})]
          (t/is (<= (jt/time-between (:updated-at result) (jt/offset-date-time) :millis) 10))))))
  (t/testing "returns empty map otherwise"
    (let [user (doto (UserRepresentation.)
                 (.setId (str (random-uuid)))
                 (.setFirstName "Hello")
                 (.setLastName "World")
                 (.setEmail (str (random-uuid) "@world.com")))]
      (with-redefs [kcu/get-user (constantly user)
                    kcu/update-user! (constantly user)]
        (let [result (store/update-user-by-uuid! {:uuid (str (random-uuid)) :email (str (random-uuid) "@world.com")})]
          (t/is (nil? result)))))))

(t/deftest ?delete-user!
  (t/testing "user exists"
    (let [user (doto (UserRepresentation.)
                 (.setId (str (random-uuid)))
                 (.setFirstName "Hello")
                 (.setLastName "World")
                 (.setEmail (str (random-uuid) "@world.com")))]
      (with-redefs [kcu/create-user! (constantly user)
                    kcu/add-required-actions! (constantly nil)
                    kcu/logout-user! (constantly nil)
                    kcu/delete-user! (constantly nil)]
        (let [created-user (store/create-user-by-email! {:email (.getEmail user)
                                                         :first-name "Hello"
                                                         :last-name "World"
                                                         :password "Test1234"})
              result (store/delete-user! (:uuid created-user))]
          (t/is (not (nil? result)))))))
  (t/testing "user does not exist"
    (t/testing "user exists"
      (with-redefs [kcu/logout-user! (constantly nil)
                    kcu/delete-user! (constantly nil)]
        (let [result (store/delete-user! (random-uuid))]
          (t/is (nil? result)))))))
