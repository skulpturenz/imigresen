(ns imigresen-api.components.hello-world.spec
  (:require
   [imigresen-api.state.db.mock]
   [imigresen-api.state.db.core]
   [spec-tools.data-spec :as ds]))

(def example (ds/spec {:name :core/example
                       :spec {:hello string?}}))

(def example-incorrect (ds/spec {:name :core/example-incorrect
                                 :spec {:hello number?}}))
