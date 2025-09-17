(ns skulpture-eventing.entity.core
  (:require [skulpture-eventing.entity.core-impl.aggregate]
            [skulpture-eventing.entity.core-impl.commit]
            [skulpture-eventing.entity.core-impl.group-aggregates]
            [skulpture-eventing.entity.core-impl.next-revision]
            [skulpture-eventing.entity.core-impl.persist]
            [skulpture-eventing.entity.core-impl.shared]
            [skulpture-eventing.entity.core-impl.snapshot]))

(def schema-registry
  "Used to ensure that the reduced state of the entity is valid.

   An entity can only be loaded if a schema is defined for it"
  skulpture-eventing.entity.core-impl.shared/schema-registry)

(defn aggregate
  "Gets the events associated with the entity id and determines the current state of the event,
   applying any additional events if specified. Additional events are not committed, to do so invoke `commit!`.

   An aggregate is composed of: the current state of the entity, events which have been committed and uncommitted events
   which have been applied to determine the current state. Expects a vector when events to apply are specified as
   order is important"
  ([entity transformer opts]
   (skulpture-eventing.entity.core-impl.aggregate/aggregate entity transformer opts))
  ([connectable entity entity-id transformer]
   (skulpture-eventing.entity.core-impl.aggregate/aggregate connectable entity entity-id transformer))
  ([connectable entity entity-id-or-aggregate transformer events]
   (skulpture-eventing.entity.core-impl.aggregate/aggregate connectable entity entity-id-or-aggregate transformer events)))

(defn commit!
  "Commit uncommitted events in an aggregate"
  [connectable entity aggregate]
  (skulpture-eventing.entity.core-impl.commit/commit! connectable entity aggregate))

(defn persist!
  "Persist events for an entity without loading all its events"
  [connectable events]
  (skulpture-eventing.entity.core-impl.persist/persist! connectable events))

(defn next-revision
  "Determine the next revision of an entity from an aggregate or the current state.

   The latest revision of events for an entity is also the revision of the current state of the entity
   so revisions should only increase as more events are associated with an entity"
  ([entity aggregate]
   (skulpture-eventing.entity.core-impl.next-revision/next-revision entity aggregate))
  ([connectable entity entity-id transformer]
   (skulpture-eventing.entity.core-impl.next-revision/next-revision connectable entity entity-id transformer)))

(defn next-revision'
  "Determine the next revision of an entity without loading its event stream

   Does not check whether the state of the entity is valid"
  [connectable entity-id]
  (skulpture-eventing.entity.core-impl.next-revision/next-revision' connectable entity-id))

(defn snapshot!
  "Creates and persists a snapshot event of the current state of the entity.

   Snapshot events are valuable when there are many events for an entity. If a snapshot exists then it is the
   starting point when events are loaded"
  [connectable entity entity-id transformer]
  (skulpture-eventing.entity.core-impl.snapshot/snapshot! connectable entity entity-id transformer))

(defn group->aggregates
  "Transform event streams bulk loaded entities into aggregates.
   Accepts a 1-arity mapper which takes the event stream for the entity and returns its aggregate"
  [events ->aggregate]
  (skulpture-eventing.entity.core-impl.group-aggregates/group->aggregates events ->aggregate))
