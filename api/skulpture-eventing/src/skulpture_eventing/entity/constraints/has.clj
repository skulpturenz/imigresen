(in-ns 'skulpture-eventing.entity.constraints)
(require '[taoensso.truss :as truss])

(defn has
  "Build a HoneySQL DSL data structure to check if entities which fit constraints exists.
   Any additional inclusion and exclusion criteria should be expressed as a HoneySQL clause.
     
   Not meant to be a replacement for a constraints table.
   A constraints table is valuable when we need to do frequent fetches.
   This is useful in the infrequent case when we wouldn't need a constraints table otherwise"
  [filters]
  (-> (truss/have map? (where filters))
      (dissoc :select-distinct)
      (assoc :select [[:1 :'has]])
      (assoc :limit 1)))
