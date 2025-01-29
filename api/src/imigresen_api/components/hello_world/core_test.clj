(ns imigresen-api.components.hello-world.core-test
  (:require [clojure.test :as t]
            [imigresen-api.state.db.mock]
            [imigresen-api.state.db.core]
            [imigresen-api.components.hello-world.core :as core]
            [mount.core :as mount]))

(defn fixture [f]
  (mount/start #'imigresen-api.state.db.mock/db)
  (mount/start-with {#'imigresen-api.state.db.core/db imigresen-api.state.db.mock/db})
  (f)
  (mount/stop))

(t/use-fixtures :once fixture)

(t/deftest example-test
  (t/testing "returns 'world'"
    (t/is (= (:hello (core/example)) "world"))))
