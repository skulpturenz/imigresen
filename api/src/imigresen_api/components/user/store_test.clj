(ns imigresen-api.components.user.store-test
  (:require [clojure.test :as t]
            [keycloak.user :as kcu]))

(t/deftest ?find-by-kc-id
  (t/testing "returns user"
    (with-redefs [kcu/get-user (constantly 1)]
      (t/is true)))
  (t/testing "returns nil otherwise"
    (with-redefs [kcu/get-user (constantly 1)]
      (t/is true))))

(t/deftest ?find-by-email
  (t/testing "returns user"
    (t/is true))
  (t/testing "returns nil otherwise"
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
  (t/testing "returns nil otherwise"
    (t/is true)))

(t/deftest ?delete-user!
  (t/testing "user exists"
    (t/is true))
  (t/testing "user does not exist"
    (t/is true)))
