(ns imigresen-api.components.hello-world.interface-spec
  (:require
   [clojure.spec.alpha :as s]
   [imigresen-api.components.hello-world.interface :as impl]
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

(s/def ::0 number?)
(s/def ::example-return (s/keys
                         :req-un [::0]))

(t/deftest get-example
  (t/testing "get-example interface"
    (t/is (s/valid? (s/fspec :args nil? :ret ::example-return) impl/get-example))))
