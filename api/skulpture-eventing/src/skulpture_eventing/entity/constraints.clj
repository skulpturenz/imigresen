(ns skulpture-eventing.entity.constraints)

(defn where
  "Build a query to search for entities which fit constraints
   
   Not meant to be a replacement for a constraints table.
   A constraints table is valuable when we need to do frequent fetches.
   This is useful in the infrequent case when we wouldn't need a constraints table otherwise"
  [{:keys [include-event-types exclude-event-types
           additional-include-filters additional-exclude-filters] :as _filters}]
  (let [default-include-filters [[:in [:->> :event-data "type"] include-event-types]]
        include-filters (into [] cat [default-include-filters additional-include-filters])
        default-exclude-filters (when ((complement nil?) exclude-event-types)
                                  [[:in [:->> :event-data "type"] exclude-event-types]])
        exclude-filters (into [] cat [default-exclude-filters additional-exclude-filters])]
    {:select :entity-id
     :from :event-journal
     :where (into [:and] cat [include-filters [[:not-in {:select :entity-id
                                                         :from :event-journal
                                                         :where (into [:and] cat [exclude-filters])}]]])}))
