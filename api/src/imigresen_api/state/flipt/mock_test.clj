(ns imigresen-api.state.flipt.mock-test
  (:require [imigresen-api.state.flipt.mock :refer [flipt create-mock-flipt-client evaluation-reason evaluation-response]]
            [clojure.test :as t]
            [mount.core :as mount]))

(defn fixture [f]
  (mount/start #'imigresen-api.state.flipt.mock/flipt)
  (f)
  (mount/stop #'imigresen-api.state.flipt.mock/flipt))

(t/use-fixtures :once fixture)

;; TODO
