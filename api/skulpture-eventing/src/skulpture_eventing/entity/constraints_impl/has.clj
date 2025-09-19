(ns skulpture-eventing.entity.constraints-impl.has
  #_{:clj-kondo/ignore [:refer :refer-all]}
  (:require [skulpture-eventing.entity.constraints-impl.where :refer :all]
            [taoensso.truss :as truss]))

(defn has
  [filters]
  (-> (truss/have map? (where filters))
      (dissoc :select-distinct)
      (assoc :select [[:1 :'has]])
      (assoc :limit 1)))
