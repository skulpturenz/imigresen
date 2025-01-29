(ns imigresen-api.state.flipt.mock
  (:require [mount.core :refer [defstate]]
            [imigresen-api.state.flipt.core :refer [start stop]]
            [org.httpkit.fake :refer [with-fake-http]]
            [imigresen-api.app.routes :refer [status-codes]]))

(def mock-flipt-url "https://localhost")

(defstate flipt
  :start (start mock-flipt-url "mock")
  :stop (stop))

(defn boolean-evaluation [res]
  (if (boolean? res)
    {:status (:ok status-codes)
     :body {:enabled res}}
    res))

(defn variant-evaluation
  ([res] res)
  ([match variant attachment request-id] {:status (:ok status-codes)
                                          :body {:match match
                                                 :variantKey variant
                                                 :variantAttachment attachment
                                                 :requestId request-id}}))

(defmacro with-mock [res & body]
  `(with-fake-http [(re-pattern mock-flipt-url) ~res]
     ~@body))
