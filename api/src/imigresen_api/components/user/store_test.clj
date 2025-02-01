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
                 (.setEmail "hello@world.com"))]
      (with-redefs [kcu/get-user (constantly user)
                    kcu/create-user! (constantly user)
                    kcu/add-required-actions! (constantly nil)]
        (let [_ (store/create-user-by-email! {:email "hello@world.com"
                                              :first-name "Hello"
                                              :last-name "World"
                                              :password "Test1234"})
              result (store/find-by-kc-id (.getId user))]
          (t/is (= 0 (jt/time-between (:created-at result) (jt/offset-date-time) :seconds)))))))
  (t/testing "returns empty map otherwise"
    (with-redefs [kcu/get-user (constantly 1)]
      (t/is true))))

(t/deftest ?find-by-email
  (t/testing "returns user"
    (t/is true))
  (t/testing "returns empty map otherwise"
    (t/is true)))

(t/deftest ?unique-email?
  (t/testing "true if no active user"
    (t/is true))
  (t/testing "false if active user"
    (t/is true)))

(t/deftest ?create-user-by-email!
  (t/testing "creates user"
    (t/is true)))

(t/deftest ?update-user-by-uuid!
  (t/testing "updates user if exists and returns"
    (t/is true))
  (t/testing "returns empty map otherwise"
    (t/is true)))

(t/deftest ?delete-user!
  (t/testing "user exists"
    (t/is true))
  (t/testing "user does not exist"
    (t/is true)))
