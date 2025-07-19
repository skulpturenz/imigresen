(ns skulpture-eventing.entity.core-test
  (:require [skulpture-eventing.entity.core :as entity]
            [skulpture-eventing.store.core :as store]
            [clojure.test :as t]
            [skulpture-eventing.store.agents :as agents]
            [taoensso.truss :as truss]
            [clj-uuid :as uuid]
            [java-time.api :as jt]
            [skulpture-eventing.test-utils.db.mock :as db-mock]
            [spec-tools.data-spec :as ds]))

(defn fixture [f]
  (swap! entity/schema-registry conj {::test (ds/spec {:name ::test
                                                       :spec {:a integer?
                                                              :b integer?}})})
  (f)
  (swap! entity/schema-registry dissoc ::test))

(t/use-fixtures :once fixture)

(defn create-event [event-data revision]
  {:event-agent "test"
   :entity-id "1234"
   :time-occurred (jt/instant)
   :time-observed (jt/instant)
   :event-data event-data
   :revision revision})

(t/deftest ^:unit aggregate
  (t/testing "preconditions"
    (with-redefs [store/load-by-entity-id (constantly [(create-event {:type :a :a 1} 1)
                                                       (create-event {:type :b :b -1} 2)
                                                       (create-event {:type :a :a 2} 3)
                                                       (create-event {:type :b :b -2} 4)])]
      (let [transformer (fn
                          ([] {})
                          ([acc] acc)
                          ([acc {{:keys [type]} :event-data :as event}]
                           (case type
                             :a (assoc acc :a (/ (get-in event [:event-data :a]) (or (:a acc) 1)))
                             :b (assoc acc :b (/ (get-in event [:event-data :b])  (or (:b acc) 1))))))]
        (t/testing "keyword entity"
          (t/is (and (truss/throws? (entity/aggregate (:ds-opts @db-mock/db) "test" 1234 transformer))
                     (entity/aggregate (:ds-opts @db-mock/db) ::test 1234 transformer)))
          (t/is (and (truss/throws? (entity/aggregate (:ds-opts @db-mock/db) "test" (entity/aggregate (:ds-opts @db-mock/db) ::test 1234 transformer) transformer []))
                     (entity/aggregate (:ds-opts @db-mock/db) ::test (entity/aggregate (:ds-opts @db-mock/db) ::test 1234 transformer) transformer []))))
        (t/testing "number, string or uuid entity id"
          (t/is (and (truss/throws? (entity/aggregate (:ds-opts @db-mock/db) ::test :1234 transformer))
                     (entity/aggregate (:ds-opts @db-mock/db) ::test 1234 transformer)
                     (entity/aggregate (:ds-opts @db-mock/db) ::test "1234" transformer)
                     (entity/aggregate (:ds-opts @db-mock/db) ::test (uuid/v7) transformer))))
        (t/testing "initial aggregate state"
          (t/is (and (truss/throws? (entity/aggregate (:ds-opts @db-mock/db) ::test [] transformer []))
                     (truss/throws? (entity/aggregate (:ds-opts @db-mock/db) ::test {} transformer []))
                     (entity/aggregate (:ds-opts @db-mock/db) ::test (entity/aggregate (:ds-opts @db-mock/db) ::test 1234 transformer) transformer []))))
        (t/testing "fn transformer"
          (t/is (and (truss/throws? (entity/aggregate (:ds-opts @db-mock/db) ::test 1234 "transformer"))
                     (entity/aggregate (:ds-opts @db-mock/db) ::test 1234 transformer)))
          (t/is (and (truss/throws? (entity/aggregate (:ds-opts @db-mock/db) ::test (entity/aggregate (:ds-opts @db-mock/db) ::test 1234 transformer) "transformer" []))
                     (entity/aggregate (:ds-opts @db-mock/db) ::test (entity/aggregate (:ds-opts @db-mock/db) ::test 1234 transformer) transformer []))))
        (t/testing "vector uncommitted events"
          (t/is (and (truss/throws? (entity/aggregate (:ds-opts @db-mock/db) ::test (entity/aggregate (:ds-opts @db-mock/db) ::test 1234 transformer) transformer '()))
                     (entity/aggregate (:ds-opts @db-mock/db) ::test (entity/aggregate (:ds-opts @db-mock/db) ::test 1234 transformer) transformer [])))))))
  (t/testing "returns current state"
    (with-redefs [store/load-by-entity-id (constantly [(create-event {:type :a :a 1} 1)
                                                       (create-event {:type :b :b -1} 2)
                                                       (create-event {:type :a :a 2} 3)
                                                       (create-event {:type :b :b -2} 4)])]
      (let [transformer (fn
                          ([] {})
                          ([acc] acc)
                          ([acc {{:keys [type]} :event-data :as event}]
                           (case type
                             :a (assoc acc :a (/ (get-in event [:event-data :a]) (or (:a acc) 1)))
                             :b (assoc acc :b (/ (get-in event [:event-data :b])  (or (:b acc) 1))))))
            aggregate (entity/aggregate (:ds-opts @db-mock/db) ::test 1 transformer)]
        (t/is (= (:aggregate aggregate) {:a 2 :b 2 :revision 4})))))
  (t/testing "applies uncommitted events"
    (with-redefs [store/load-by-entity-id (constantly [(create-event {:type :a :a 1} 1)
                                                       (create-event {:type :b :b -1} 2)
                                                       (create-event {:type :a :a 2} 3)
                                                       (create-event {:type :b :b -2} 4)])]
      (let [transformer (fn
                          ([] {})
                          ([acc] acc)
                          ([acc {{:keys [type]} :event-data :as event}]
                           (case type
                             :a (assoc acc :a (/ (get-in event [:event-data :a]) (or (:a acc) 1)))
                             :b (assoc acc :b (/ (get-in event [:event-data :b])  (or (:b acc) 1))))))
            uncommitted-events [(create-event {:type :a :a 1} 5)
                                (create-event {:type :b :b -1} 6)
                                (create-event {:type :a :a 2} 7)
                                (create-event {:type :b :b -2} 8)]
            aggregate (entity/aggregate (:ds-opts @db-mock/db) ::test 1 transformer uncommitted-events)]
        (t/is (= (:aggregate aggregate) {:a 4 :b 4 :revision 8}))
        (t/is (= (:uncommitted-events aggregate) uncommitted-events)))))
  (t/testing "applies uncommitted events to an existing aggregate"
    (with-redefs [store/load-by-entity-id (constantly [(create-event {:type :a :a 1} 1)
                                                       (create-event {:type :b :b -1} 2)
                                                       (create-event {:type :a :a 2} 3)
                                                       (create-event {:type :b :b -2} 4)])]
      (let [transformer (fn
                          ([] {})
                          ([acc] acc)
                          ([acc {{:keys [type]} :event-data :as event}]
                           (case type
                             :a (assoc acc :a (/ (get-in event [:event-data :a]) (or (:a acc) 1)))
                             :b (assoc acc :b (/ (get-in event [:event-data :b])  (or (:b acc) 1))))))
            initial (entity/aggregate (:ds-opts @db-mock/db) ::test 1 transformer)
            uncommitted-events [(create-event {:type :a :a 1} 5)
                                (create-event {:type :b :b -1} 6)
                                (create-event {:type :a :a 2} 7)
                                (create-event {:type :b :b -2} 8)]
            final (entity/aggregate (:ds-opts @db-mock/db) ::test initial transformer uncommitted-events)]
        (t/is (= (:aggregate final) {:a 4 :b 4 :revision 8}))
        (t/is (= (:uncommitted-events final) uncommitted-events))))))

(t/deftest ^:unit commit!
  (t/testing "preconditions"
    (with-redefs [store/load-by-entity-id (constantly [(create-event {:type :a :a 1} 1)
                                                       (create-event {:type :b :b -1} 2)
                                                       (create-event {:type :a :a 2} 3)
                                                       (create-event {:type :b :b -2} 4)])]
      (let [transformer (fn
                          ([] {})
                          ([acc] acc)
                          ([acc {{:keys [type]} :event-data :as event}]
                           (case type
                             :a (assoc acc :a (/ (get-in event [:event-data :a]) (or (:a acc) 1)))
                             :b (assoc acc :b (/ (get-in event [:event-data :b]) (or (:b acc) 1))))))
            uncommitted-events [(create-event {:type :a :a 1} 5)
                                (create-event {:type :b :b -1} 6)
                                (create-event {:type :a :a 2} 7)
                                (create-event {:type :b :b -2} 8)]
            aggregate (entity/aggregate (:ds-opts @db-mock/db) ::test 1 transformer uncommitted-events)]
        (with-redefs [store/persist! (constantly (:aggregate aggregate))]
          (t/testing "keyword entity"
            (t/is (and (truss/throws? (entity/commit! (:ds-opts @db-mock/db) "test" aggregate))
                       (entity/commit! (:ds-opts @db-mock/db) ::test aggregate))))
          (t/testing "aggregate state"
            (t/is (and (truss/throws? (entity/commit! (:ds-opts @db-mock/db) ::test []))
                       (truss/throws? (entity/commit! (:ds-opts @db-mock/db) ::test {}))
                       (entity/commit! (:ds-opts @db-mock/db) ::test aggregate))))))))
  (t/testing "persists uncommitted events"
    (with-redefs [store/load-by-entity-id (constantly [(create-event {:type :a :a 1} 1)
                                                       (create-event {:type :b :b -1} 2)
                                                       (create-event {:type :a :a 2} 3)
                                                       (create-event {:type :b :b -2} 4)])]
      (let [transformer (fn
                          ([] {})
                          ([acc] acc)
                          ([acc {{:keys [type]} :event-data :as event}]
                           (case type
                             :a (assoc acc :a (/ (get-in event [:event-data :a]) (or (:a acc) 1)))
                             :b (assoc acc :b (/ (get-in event [:event-data :b]) (or (:b acc) 1))))))
            uncommitted-events [(create-event {:type :a :a 1} 5)
                                (create-event {:type :b :b -1} 6)
                                (create-event {:type :a :a 2} 7)
                                (create-event {:type :b :b -2} 8)]
            aggregate (entity/aggregate (:ds-opts @db-mock/db) ::test 1 transformer uncommitted-events)]
        (with-redefs [store/persist! (constantly (:aggregate aggregate))]
          (let [persisted (entity/commit! (:ds-opts @db-mock/db) ::test aggregate)]
            (t/is (= (:aggregate persisted) (:aggregate aggregate)))
            (t/is (= (:events persisted) (into (:events aggregate) (:uncommitted-events aggregate))))
            (t/is (= (:uncommitted-events persisted) []))))))))

(t/deftest ^:unit next-revision
  (t/testing "preconditions"
    (with-redefs [store/load-by-entity-id (constantly [(create-event {:type :a :a 1} 1)
                                                       (create-event {:type :b :b -1} 2)
                                                       (create-event {:type :a :a 2} 3)
                                                       (create-event {:type :b :b -2} 4)])]
      (let [transformer (fn
                          ([] {})
                          ([acc] acc)
                          ([acc {{:keys [type]} :event-data :as event}]
                           (case type
                             :a (assoc acc :a (/ (get-in event [:event-data :a]) (or (:a acc) 1)))
                             :b (assoc acc :b (/ (get-in event [:event-data :b]) (or (:b acc) 1))))))]
        (t/testing "keyword entity"
          (t/is (and (truss/throws? (entity/next-revision "test" {:aggregate {:a 1 :b 1 :revision 1} :events [] :uncommitted-events []}))
                     (entity/next-revision ::test {:aggregate {:a 1 :b 1 :revision 1} :events [] :uncommitted-events []})))
          (t/is (and (truss/throws? (entity/next-revision (:ds-opts @db-mock/db) "test" 1 transformer))
                     (entity/next-revision (:ds-opts @db-mock/db) ::test 1 transformer))))
        (t/testing "string, number, uuid entity id"
          (t/is (and (truss/throws? (entity/next-revision (:ds-opts @db-mock/db) ::test :1234 transformer))
                     (entity/next-revision (:ds-opts @db-mock/db) ::test 1234 transformer)
                     (entity/next-revision (:ds-opts @db-mock/db) ::test "1234" transformer)
                     (entity/next-revision (:ds-opts @db-mock/db) ::test (uuid/v7) transformer))))
        (t/testing "fn transformer"
          (t/is (and (truss/throws? (entity/next-revision (:ds-opts @db-mock/db) ::test 1234 "transformer"))
                     (entity/next-revision (:ds-opts @db-mock/db) ::test 1234 transformer)))))))
  (t/testing "+ 1 from aggregate"
    (let [aggregate {:aggregate {:a 1 :b 1 :revision 1} :events [] :uncommitted-events []}]
      (t/is (= (entity/next-revision ::test aggregate) 2))))
  (t/testing "+ 1 from store"
    (with-redefs [store/load-by-entity-id (constantly [(create-event {:type :a :a 1} 1)
                                                       (create-event {:type :b :b -1} 2)
                                                       (create-event {:type :a :a 2} 3)
                                                       (create-event {:type :b :b -2} 4)])]
      (let [transformer (fn
                          ([] {})
                          ([acc] acc)
                          ([acc {{:keys [type]} :event-data :as event}]
                           (case type
                             :a (assoc acc :a (/ (get-in event [:event-data :a]) (or (:a acc) 1)))
                             :b (assoc acc :b (/ (get-in event [:event-data :b]) (or (:b acc) 1))))))]
        (t/is (= (entity/next-revision (:ds-opts @db-mock/db) ::test 1 transformer) 5))))))

(t/deftest ^:unit snapshot
  (t/testing "preconditions"
    (with-redefs [store/load-by-entity-id (constantly [(create-event {:type :a :a 1} 1)
                                                       (create-event {:type :b :b -1} 2)
                                                       (create-event {:type :a :a 2} 3)
                                                       (create-event {:type :b :b -2} 4)])
                  store/persist! (fn [_connectable events] (first events))]
      (let [transformer (fn
                          ([] {})
                          ([acc] acc)
                          ([acc {{:keys [type]} :event-data :as event}]
                           (case type
                             :a (assoc acc :a (/ (get-in event [:event-data :a]) (or (:a acc) 1)))
                             :b (assoc acc :b (/ (get-in event [:event-data :b]) (or (:b acc) 1))))))]
        (t/testing "keyword entity"
          (t/is (and (truss/throws? (entity/snapshot (:ds-opts @db-mock/db) "test" 1 transformer))
                     (entity/snapshot (:ds-opts @db-mock/db) ::test 1 transformer)))
          (t/is (and (truss/throws? (entity/snapshot (:ds-opts @db-mock/db) "test" 1 transformer))
                     (entity/snapshot (:ds-opts @db-mock/db) ::test 1 transformer))))
        (t/testing "string, number, uuid entity id"
          (t/is (and (truss/throws? (entity/snapshot (:ds-opts @db-mock/db) ::test :1234 transformer))
                     (entity/snapshot (:ds-opts @db-mock/db) ::test 1234 transformer)
                     (entity/snapshot (:ds-opts @db-mock/db) ::test "1234" transformer)
                     (entity/snapshot (:ds-opts @db-mock/db) ::test (uuid/v7) transformer))))
        (t/testing "fn transformer"
          (t/is (and (truss/throws? (entity/snapshot (:ds-opts @db-mock/db) ::test 1234 "transformer"))
                     (entity/snapshot (:ds-opts @db-mock/db) ::test 1234 transformer)))))))
  (t/testing "creates and persists a snapshot event"
    (with-redefs [store/load-by-entity-id (constantly [(create-event {:type :a :a 1} 1)
                                                       (create-event {:type :b :b -1} 2)
                                                       (create-event {:type :a :a 2} 3)
                                                       (create-event {:type :b :b -2} 4)])
                  store/persist! (fn [_connectable events] (first events))]
      (let [transformer (fn
                          ([] {})
                          ([acc] acc)
                          ([acc {{:keys [type]} :event-data :as event}]
                           (case type
                             :a (assoc acc :a (/ (get-in event [:event-data :a]) (or (:a acc) 1)))
                             :b (assoc acc :b (/ (get-in event [:event-data :b])  (or (:b acc) 1))))))
            snapshot (entity/snapshot (:ds-opts @db-mock/db) ::test 1 transformer)]
        (t/is (= (:event-agent snapshot) (:snapshot agents/system-agents)))
        (t/is (= (:entity-id snapshot) 1))
        (t/is (= (:revision snapshot) 5))
        (t/is (= (:event snapshot) {:a 2 :b 2}))))))
