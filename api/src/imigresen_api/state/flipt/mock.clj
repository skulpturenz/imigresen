(ns imigresen-api.state.flipt.mock
  (:require [mount.core :refer [defstate]]
            [taoensso.telemere :as t])
  (:import (io.flipt.api FliptClient
                         Evaluation)))

(def ^:private flipt-agent (agent {}))

;; {:namespace {:flag-key :resolver}}
(defn create-mock-flipt-client [config]
  (let [evaluate #((let [namespace ((keyword (.getNamespaceKey %)) config)
                         resolver ((keyword (.getFlagKey %)) namespace)]
                     (resolver %)))
        evaluation (proxy [Evaluation] []
                     (evaluateVariant evaluate)
                     (evaluateBoolean evaluate)
                     (evaluateBatch evaluate))]
    (proxy [FliptClient] []
      (evaluation [] evaluation))))

(defn- start [client]
  (t/log! :debug "flipt mock state start")
  (send flipt-agent assoc :flipt-client client)
  (await flipt-agent)
  flipt-agent)

(defn- stop []
  (t/log! :debug "flipt mock state stop")
  (send flipt-agent dissoc :flipt-client)
  (await flipt-agent)
  ;; return agent
  flipt-agent)

(defstate flipt-state
  :start start
  :stop (stop))
