(ns imigresen-api.components.hello-world.interface-test
  (:require
   [clojure.spec.alpha :as s]
   [imigresen-api.components.hello-world.interface :as impl]
   [imigresen-api.components.hello-world.interface-spec :as spec]
   [clojure.test :as t]
   [mount.core :as mount]
   [imigresen-api.state.db.mock]
   [imigresen-api.state.db.core]))

(defn fixture [f]
  (mount/start #'imigresen-api.state.db.mock/db)
  (mount/start-with {#'imigresen-api.state.db.core/db imigresen-api.state.db.mock/db})
  (f)
  (mount/stop))

(t/use-fixtures :once fixture)

(t/deftest get-example
  (t/testing "get-example interface"
    (t/is (s/valid? spec/get-example impl/get-example))
    (t/is (not (s/valid? spec/get-example-incorrect impl/get-example)))))
