(ns imigresen-api.state.flipt.mock
  (:require [mount.core :refer [defstate]]
            [imigresen-api.state.flipt.core :refer [start stop]]
            [org.httpkit.fake :refer [with-fake-http]]
            [imigresen-api.app.routes :refer [status-codes]]))

(def ^:private mock-flipt-url "https://localhost")

(defstate flipt
  :start (start mock-flipt-url "mock")
  :stop (stop))

;; TODO: fn form might be better
;; need to return a string or a partial of actual response map
(defn boolean-evaluation [enabled] {"status" (:ok status-codes)
                                    "enabled" enabled})

;; TODO: request id from original request
(defn variant-evaluation [match variant attachment] {"status" (:ok status-codes)
                                                     "match" match
                                                     "variant-key" variant
                                                     "variant-attachment" attachment})
(defmacro with-mock [res & expr]
  `(with-fake-http [mock-flipt-url ~res]
     ~expr))
