(ns skulpture-eventing.entity.core)

(def schema-registry
  "Used to ensure that the reduced state of the entity is valid.
   
   An entity can only be loaded if a schema is defined for it"
  (atom {}))

(load "core/aggregate")
(load "core/commit")
(load "core/persist")
(load "core/next-revision")
(load "core/snapshot")
