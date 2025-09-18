(in-ns 'skulpture-eventing.entity.core)
(require '[skulpture-eventing.store.core :as store]
         '[taoensso.truss :as truss]
         '[clojure.spec.alpha :as s]
         '[skulpture-eventing.entity.spec :as es]
         '[next.jdbc.protocols :as jdbc-protocols])

(declare schema-registry)

(defn commit!
  "Commit uncommitted events in an aggregate"
  [connectable entity aggregate]
  ;; TODO: need to update existing usages
  {:pre [(and (and (truss/have? #(satisfies? jdbc-protocols/Connectable %) connectable)
                   (truss/have? #((complement satisfies?) jdbc-protocols/Wrapped) connectable)
                   (truss/have? #((complement satisfies?) jdbc-protocols/Transactable) connectable))
              (truss/have? keyword? entity)
              (truss/have? es/aggregate? aggregate))]}
  (let [schema ((keyword entity) @schema-registry)]
    (when (truss/have (partial s/valid? schema) (:aggregate aggregate))
      (jdbc/with-transaction [tx connectable]
        (let [result (pvalues
                      (truss/have (project! tx aggregate))
                      (truss/have (store/persist! connectable (:uncommitted-events aggregate))))
              completed (every? some? result)]
          {:aggregate (:aggregate aggregate)
           :events (into [] cat [(:events aggregate) (:uncommitted-events aggregate)])
           :uncommitted-events []})))))
