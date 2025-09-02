(ns skulpture-eventing.store.adapters.jdbc
  (:require [skulpture-eventing.store.protocol :as protocol]
            [clojure.core.cache :as cache]))

#_{:clojure-lsp/ignore [:clojure-lsp/unused-public-var]}
(def lirs-cache (atom (cache/lirs-cache-factory {})))

#_{:clojure-lsp/ignore [:clojure-lsp/unused-public-var]}
(def ^:dynamic *event-store-cache* true)

(defn create-jdbc-event-store
  [connectable]
  (reify
    protocol/EventStore
    (load-by-entity-id [_this entity-id]
      (declare load-by-entity-id)
      (load-by-entity-id connectable entity-id))
    (load-by-entity-ids [_this entity-ids]
      (declare load-by-entity-ids)
      (load-by-entity-ids connectable entity-ids))
    (load-by-entity-id-and-revision [_this entity-id revision]
      (declare load-by-entity-id-and-revision)
      (load-by-entity-id-and-revision connectable entity-id revision))
    (count-by-entity-id [_this entity-id]
      (declare count-by-entity-id)
      (count-by-entity-id connectable entity-id))
    (next-revision [_this entity-id]
      (declare next-revision)
      (next-revision connectable entity-id))
    (persist! [_this events]
      (declare persist!)
      (persist! connectable events))))

(load "jdbc/load-by-entity-id")
(load "jdbc/load-by-entity-ids")
(load "jdbc/load-by-entity-id-and-revision")
(load "jdbc/count-by-entity-id")
(load "jdbc/next-revision")
(load "jdbc/persist")
