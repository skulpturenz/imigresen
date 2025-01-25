(ns imigresen-api.components.hello-world.interface-spec
  (:require
   [clojure.spec.alpha :as s]
   [imigresen-api.components.hello-world.interface :as impl]
   [clojure.test :as t]
   [mount.core :as mount]
   [imigresen-api.state.db.mock]
   [imigresen-api.state.db.core]))

(defn fixture [f]
  (mount/start-with {#'imigresen-api.state.db.core/db imigresen-api.state.db.mock/db})
  (f)
  (mount/stop))

(t/use-fixtures :once fixture)

(t/deftest get-example
  (t/testing "get-example interface"
    (t/is (s/valid? (s/fspec :args nil? :ret number?) impl/get-example))))
