(ns skulpture-eventing.test-utils.db.mock-test
  (:require [skulpture-eventing.test-utils.db.mock :refer [db] :as db-mock]
            [clojure.test :as t]
            [mount.core :as mount]
            [honey.sql :as sql]
            [next.jdbc :as jdbc]))

(defn fixture [f]
  (mount/start #'skulpture-eventing.test-utils.db.mock/db)
  (f)
  (mount/stop #'skulpture-eventing.test-utils.db.mock/db))

(t/use-fixtures :once fixture)

(t/deftest ^:unit select
  (t/testing "able to query"
    (t/is (= (:test (jdbc/execute-one! (:ds @db) (sql/format {:select [[:0 "test"]]}))) 0))))
