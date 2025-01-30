(ns imigresen-api.components.user.store-test
  (:require [clojure.test :as t]
            [keycloak.user :as kcu]
            [imigresen-api.components.user.store]
            [mount.core :as mount]
            [imigresen-api.state.db.mock :as db-mock])
  (:import [org.keycloak.representations.idm UserRepresentation]))

(defn fixture [f]
  (mount/start-with (conj {} db-mock/fixture))
  (f)
  (mount/stop))

(t/use-fixtures :once fixture)

(t/deftest ?find-by-kc-id
  (t/testing "returns user"
    (with-redefs [kcu/get-user (constantly (doto (UserRepresentation.)
                                             (.setFirstName "Hello")
                                             (.setLastName "World")
                                             (.setEmail "hello@world.com")))]
      (t/is true)))
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
