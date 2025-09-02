(ns skulpture-eventing.store.protocol)

(defprotocol EventStore
  (load-by-entity-id [this entity-id]
    "Load all events for an entity by its id.

     Events are ordered by the time the occurred and their revision.

     If snapshots are available starts from the snapshot.")
  (load-by-entity-ids [this entity-ids]
    "Load all events for entities by entity ids.

     Events are ordered by the time occurred and their revision.

     If snapshots are available starts from the snapshot.")
  (load-by-entity-id-and-revision [this entity-id revision]
    "Load all events for an entity by its id and revision.

     Events are ordered by the time occurred and their revision.

     If snapshots are available starts from the snapshot.")
  (count-by-entity-id [this entity-id]
    "Count the number of events for an entity by its id")
  (next-revision [this entity-id]
    "Get the next revision without loading all events for an entity")
  (persist! [this events]
    "Persist a stream of events"))
