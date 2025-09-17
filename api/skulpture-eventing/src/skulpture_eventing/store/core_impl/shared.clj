(ns skulpture-eventing.store.core-impl.shared
  (:require [clojure.core.cache :as cache]))

(def lirs-cache (atom (cache/lirs-cache-factory {})))

(def ^:dynamic *event-store-cache* true)
