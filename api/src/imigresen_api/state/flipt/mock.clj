(ns imigresen-api.state.flipt.mock
  (:require [mount.core :refer [defstate]]
            [imigresen-api.state.flipt.core :refer [start stop enabled? variant]]))

(defstate flipt
  :start (start)
  :stop (stop))
