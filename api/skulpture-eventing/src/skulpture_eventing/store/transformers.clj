(ns skulpture-eventing.store.transformers
  (:require [clj-uuid :as uuid]
            [java-time.api :as jt]))

(def event->sql-value  (fn [event]
                         {:event-agent (:event-agent event)
                          :entity-id (str (or (:entity-id event) (uuid/v7)))
                          :time-occurred (or (:time-occurred event) (jt/instant))
                          :time-observed (:time-observed event)
                          :event-data [:lift (:event-data event)]
                          :revision (:revision event)}))

(def projection->sql-value (fn [agent projection-type entity-id projection revision]
                             {:projection-type (str projection-type)
                              :last-updated-by (str agent)
                              :entity-id (str entity-id)
                              :revision revision
                              :projection [:lift projection]}))

(defn projection<-sql-value (fn [v]
                              (:event-journal/projection v)))
