(ns skulpture-eventing.store.transformers
  (:require [clj-uuid :as uuid]
            [java-time.api :as jt]))

(def ->sql-value  #(vector (:event-agent %)
                           (str (or (:entity-id %) (uuid/v7)))
                           (or (:time-occurred %) (jt/instant))
                           (:time-observed %)
                           [:lift (:event-data %)]
                           (:revision %)))
