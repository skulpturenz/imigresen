(ns skulpture-eventing.entity.constraints
  (:require '[skulpture-eventing.entity-utils.apply :as apply]
            '[taoensso.truss :as truss]))

(declare where)
(load "constraints/where")

(declare has)
(load "constraints/has")

(declare create-migration
         create-events)
(load "constraints/migrate")
