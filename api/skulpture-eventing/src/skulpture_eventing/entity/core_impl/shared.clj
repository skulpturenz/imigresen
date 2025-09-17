(ns skulpture-eventing.entity.core-impl.shared)

(def schema-registry
  "Used to ensure that the reduced state of the entity is valid.

   An entity can only be loaded if a schema is defined for it"
  (atom {}))
