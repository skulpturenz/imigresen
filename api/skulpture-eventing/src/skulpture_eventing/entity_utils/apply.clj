(ns skulpture-eventing.entity-utils.apply
  "This namespace is not meant to be used directly
     
   Use `skulpture-eventing.entity.core` instead"
  (:require [taoensso.truss :as truss]))

(declare aggregate
         latest-revision
         next-revision
         valid-stream?)

(defn aggregate
  "Determine the current state of an entity from its events ordered by revision"
  [transformer events]
  (let [reduced (reduce transformer {} (sort-by :revision (truss/have valid-stream? events)))]
    (assoc reduced :revision (latest-revision events))))

(defn latest-revision
  "Get the latest revision from a stream of unordered events"
  [events]
  (:revision (apply max-key :revision (truss/have seq events))))

(defn next-revision
  "Get the next revision from an aggregate"
  [aggregate]
  (inc' (or (:revision aggregate) 0)))

(defn valid-stream?
  "A stream of events is valid if:
   - The latest revision in the stream is equal to the number of events
   - The revision of each event increases monotonically in steps of 1"
  [events]
  (and (= (latest-revision (truss/have seq events)) (count (truss/have seq events)))
       (= (map :revision (sort-by :revision (truss/have seq events)))
          (range (:revision (apply min-key :revision (truss/have seq events))) (inc (count (truss/have seq events))) 1))))
