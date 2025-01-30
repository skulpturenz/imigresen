(ns imigresen-api.state.db.mock-test
  (:require [imigresen-api.state.db.mock :refer [db] :as db-mock]
            [clojure.test :as t]
            [mount.core :as mount]
            [honey.sql :as sql]
            [next.jdbc :as jdbc]))

(defn fixture [f]
  (mount/start (conj {} db-mock/fixture))
  (f)
  (mount/stop))

(t/use-fixtures :once fixture)

(t/deftest select
  (t/testing "able to query"
    (t/is (= (:0 (jdbc/execute-one! (:ds @db) (sql/format {:select :0}))) 0))))
