(ns skulpture-eventing.store.core
  "This namespace is not meant to be used directly
   
   Use `skulpture-eventing.entity.core` instead"
  (:require [clojure.core.cache :as cache]))

(def lirs-cache (atom (cache/lirs-cache-factory {})))

(def ^:dynamic *event-store-cache* true)

(declare load-by-entity-id)
(load "core/load-by-entity-id")

(declare load-by-entity-ids)
(load "core/load-by-entity-ids")

(declare load-by-entity-id-and-revision)
(load "core/load-by-entity-id-and-revision")

(declare count-by-entity-id)
(load "core/count-by-entity-id")

(declare next-revision)
(load "core/next-revision")

(declare persist!)
(load "core/persist")
