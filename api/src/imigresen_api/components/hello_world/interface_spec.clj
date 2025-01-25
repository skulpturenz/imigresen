(ns imigresen-api.components.hello-world.interface-spec
  (:require
   [clojure.spec.alpha :as s]
   [imigresen-api.components.hello-world.interface :as impl]
   [clojure.test :as t]
   [mount.core :as mount]
   [imigresen-api.state.db.mock]
   [imigresen-api.state.db.core]
   [spec-tools.data-spec :as ds]))

(defn fixture [f]
  (mount/start #'imigresen-api.state.db.mock/db)
  (mount/start-with {#'imigresen-api.state.db.core/db imigresen-api.state.db.mock/db})
  (f)
  (mount/stop))

(t/use-fixtures :once fixture)

(def example (ds/spec {:name :core/example
                       :spec {:0 number?}}))

(def example-incorrect (ds/spec {:name :core/example-incorrect
                                 :spec {:0 string?}}))

(t/deftest get-example
  (t/testing "get-example interface"
    (t/is (s/valid? (s/fspec :args nil? :ret example) impl/get-example))
    (t/is (not (s/valid? (s/fspec :args nil? :ret example-incorrect) impl/get-example)))))
