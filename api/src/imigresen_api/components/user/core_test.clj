(ns imigresen-api.components.user.core-test
  (:require [clojure.test :as t]
            [imigresen-api.components.user.core :as core]
            [mount.core :as mount]
            [imigresen-api.state.db.mock :as db-mock]
            [imigresen-api.state.db.core]
            [clj-uuid :as uuid]))

(defn fixture [f]
  (mount/start #'imigresen-api.state.db.mock/db)
  (mount/start-with {#'imigresen-api.state.db.core/db imigresen-api.state.db.mock/db})
  (f)
  (mount/stop))

(t/use-fixtures :once fixture)

(t/deftest ^:unit ?login
  (t/testing "invalid user"
    (let [deps {:find-by-kc-id (constantly nil)}]
      (t/is (thrown? Exception (core/login deps "123")))))
  (t/testing "valid user"
    (let [deps {:find-by-kc-id (constantly {:uuid (uuid/v7)})}]
      (t/is (not (nil? (core/login deps "123")))))))

(t/deftest ^:unit ?register!
  (t/testing "email not unique"
    (let [deps {:create-user-by-email! (constantly nil)
                :unique-email? (constantly false)}]
      (t/is (thrown? Exception (core/register! deps {:email "test@test.com"})))))
  (t/testing "email unique"
    (let [deps {:create-user-by-email! (constantly 1)
                :unique-email? (constantly true)}]
      (t/is (= 1 (core/register! deps {:email "test@test.com"}))))))

(t/deftest ^:unit ?update-user!
  (t/testing "returns result"
    (let [deps {:update-user-by-uuid! (constantly 1)}]
      (t/is (= 1 (core/update-user! deps {:uuid (uuid/v7) :email "test@test.com"}))))))

(t/deftest ^:unit ?delete!
  (t/testing "returns result"
    (let [deps {:delete-user! (constantly 1)}]
      (t/is (= 1 (core/delete! deps {:uuid (uuid/v7)}))))))
