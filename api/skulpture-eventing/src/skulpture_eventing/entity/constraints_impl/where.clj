(ns skulpture-eventing.entity.constraints-impl.where
  (:require [taoensso.truss :as truss]))

(defn where
  [{:keys [include-event-types exclude-with-event-types
           additional-include-filters additional-exclude-filters]
    :as _filters}]
  {:pre [(and (truss/have? vector? include-event-types)
              (truss/have? #(or (vector? %) (nil? %)) exclude-with-event-types)
              (truss/have? #(or (vector? %) (nil? %)) additional-include-filters)
              (truss/have? #(or (vector? %) (nil? %)) additional-exclude-filters))]}
  (let [default-include-filters [[:in [:->> :event-data "type"] include-event-types]]
        include-filters (into [] cat [default-include-filters additional-include-filters])
        default-exclude-filters (when ((complement nil?) exclude-with-event-types)
                                  [[:in [:->> :event-data "type"] exclude-with-event-types]])
        exclude-filters (into [] cat [default-exclude-filters additional-exclude-filters])]
    {:select-distinct :entity-id
     :from :event-journal
     :where (into [:and] cat [(when (not-empty exclude-filters)
                                [[:not-in {:select :entity-id
                                           :from :event-journal
                                           :where (into [:and] cat [exclude-filters])}]])
                              include-filters])}))
