(ns imigresen-api.state.flipt.mock
  (:require [mount.core :refer [defstate]]
            [imigresen-api.state.flipt.core :refer [start stop]]
            [org.httpkit.fake :refer [with-fake-http]]))

(def ^:private mock-flipt-url "https://localhost")

(defstate flipt
  :start (start mock-flipt-url "mock")
  :stop (stop))

(defn boolean-evaluation [enabled] {"enabled" enabled})

(defn variant-evaluation [match variant attachment] {"match" match
                                                     "variant-key" variant
                                                     "variant-attachment" attachment})
(defmacro with-mock [res & expr]
  `(with-fake-http [mock-flipt-url ~res]
     ~expr))
