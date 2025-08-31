(ns skulpture-eventing.store.core
  "This namespace is not meant to be used directly
   
   Use `skulpture-eventing.entity.core` instead"
  (:require [clojure.core.cache :as cache])
  (:gen-class :main true))

(def lirs-cache (atom (cache/lirs-cache-factory {})))

(def ^:dynamic *event-store-cache* true)

(load "core/load-by-entity-id")
(load "core/load-by-entity-ids")
(load "core/load-by-entity-id-and-revision")
(load "core/count-by-entity-id")
(load "core/next-revision")
(load "core/persist")
