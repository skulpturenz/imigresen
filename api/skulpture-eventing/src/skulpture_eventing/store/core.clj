(ns skulpture-eventing.store.core
  "This namespace is not meant to be used directly

   Use `skulpture-eventing.entity.core` instead"
  (:require [skulpture-eventing.store.core-impl.count-by-entity-id]
            [skulpture-eventing.store.core-impl.load-by-entity-id]
            [skulpture-eventing.store.core-impl.load-by-entity-id-and-revision]
            [skulpture-eventing.store.core-impl.load-by-entity-ids]
            [skulpture-eventing.store.core-impl.next-revision]
            [skulpture-eventing.store.core-impl.persist]))

(defn count-by-entity-id
  "Count the number of events for an entity by its id"
  [connectable entity-id]
  (skulpture-eventing.store.core-impl.count-by-entity-id/count-by-entity-id connectable entity-id))

(defn load-by-entity-id
  "Load all events for an entity by its id.

   Events are ordered by the time the occurred and their revision.

   If snapshots are available starts from the snapshot."
  [connectable entity-id]
  (skulpture-eventing.store.core-impl.load-by-entity-id/load-by-entity-id connectable entity-id))

(defn load-by-entity-id-and-revision
  "Load all events for an entity by its id and revision.

   Events are ordered by the time occurred and their revision.

   If snapshots are available starts from the snapshot."
  [connectable entity-id revision]
  (skulpture-eventing.store.core-impl.load-by-entity-id-and-revision/load-by-entity-id-and-revision connectable entity-id revision))

(defn load-by-entity-ids
  "Load all events for entities by entity ids.

   Events are ordered by the time occurred and their revision.

   If snapshots are available starts from the snapshot."
  [connectable entity-ids]
  (skulpture-eventing.store.core-impl.load-by-entity-ids/load-by-entity-ids connectable entity-ids))

(defn next-revision
  "Get the next revision without loading all events for an entity"
  [connectable entity-id]
  (skulpture-eventing.store.core-impl.next-revision/next-revision connectable entity-id))

(defn persist!
  "Persist a stream of events"
  [connectable events]
  (skulpture-eventing.store.core-impl.persist/persist! connectable events))
