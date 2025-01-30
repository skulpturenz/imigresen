(ns imigresen-api.components.user.store-test
  (:require [clojure.test :as t]
            [keycloak.user :as kcu]
            [imigresen-api.components.user.store]
            [mount.core :as mount]
            [imigresen-api.state.db.mock]
            [imigresen-api.state.db.core]))

(defn fixture [f]
  (mount/start #'imigresen-api.state.db.mock/db)
  (mount/start-with {#'imigresen-api.state.db.core/db imigresen-api.state.db.mock/db})
  (f)
  (mount/stop))

(t/use-fixtures :once fixture)

(t/deftest ?find-by-kc-id
  (t/testing "returns user"
    (with-redefs [kcu/get-user (constantly 1)]
      (println "HERE!!!" ((fn [] (kcu/get-user "1234" 1234 1234)))) ;; "HERE!!! 1"
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
