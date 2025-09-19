(ns skulpture-eventing.test-utils.db.mock-test
  (:require [clojure.test :as t]
            [honey.sql :as sql]
            [mount.core :as mount]
            [next.jdbc :as jdbc]
            [skulpture-eventing.test-utils.db.mock :as db-mock]))

(defn fixture [f]
  (mount/start #'skulpture-eventing.test-utils.db.mock/db)
  (f)
  (mount/stop #'skulpture-eventing.test-utils.db.mock/db))

(t/use-fixtures :once fixture)

(t/deftest ^:unit select
  (t/testing "able to query"
    (t/is (= (:test (jdbc/execute-one! (:ds @db-mock/db) (sql/format {:select [[:0 "test"]]}))) 0))))
