(ns imigresen-api.state.db.mock-test
  (:require
   [imigresen-api.state.db.mock :refer [db]]
   [clojure.test :as t]
   [mount.core :as mount]
   [honey.sql :as sql]
   [next.jdbc :as jdbc]))

(defn fixture [f]
  (mount/start #'imigresen-api.state.db.mock/db)
  (await db)
  (f)
  (mount/stop #'imigresen-api.state.db.mock/db))

(t/use-fixtures :once fixture)

(t/deftest select
  (t/testing "able to query"
    (t/is (= (:0 (jdbc/execute-one! (:ds @db) (sql/format {:select :0}))) 0))))
