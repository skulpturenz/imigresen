(ns imigresen-api.components.hello-world.interface-spec
  (:require
   [imigresen-api.state.db.mock]
   [imigresen-api.state.db.core]
   [spec-tools.data-spec :as ds]
   [clojure.spec.alpha :as s]
   [imigresen-api.components.hello-world.interface]))

(def example (ds/spec {:name :core/example
                       :spec {:hello string?}}))

(def example-incorrect (ds/spec {:name :core/example-incorrect
                                 :spec {:hello number?}}))

(def get-example (s/fspec :args nil? :ret example))

(def get-example-incorrect (s/fspec :args nil? :ret example-incorrect))
