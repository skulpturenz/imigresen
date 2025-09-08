(ns skulpture-eventing.store.transformers
  (:require [clj-uuid :as uuid]
            [java-time.api :as jt]))

(def ->sql-value  (fn [event]
                    {:event-agent (:event-agent event)
                     :entity-id (str (or (:entity-id event) (uuid/v7)))
                     :time-occurred (or (:time-occurred event) (jt/instant))
                     :time-observed (:time-observed event)
                     :event-data [:lift (:event-data event)]
                     :revision (:revision event)}))
