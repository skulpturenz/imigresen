(ns skulpture-eventing.store.core-test
  (:require [clj-uuid :as uuid]
            [clojure.test :as t]
            [java-time.api :as jt]
            [mount.core :as mount]
            [skulpture-eventing.store.agents :as agents]
            [skulpture-eventing.store.core :as store]
            [skulpture-eventing.test-utils.db.mock :as db-mock]))

(defn fixture [f]
  (mount/start #'skulpture-eventing.test-utils.db.mock/db)
  (f)
  (mount/stop #'skulpture-eventing.test-utils.db.mock/db))

(t/use-fixtures :once fixture)

(t/deftest ^:unit persist
  (t/testing "persists events"
    (let [events [{:event-agent "test"
                   :event-data {:hello "world"}
                   :revision 1}
                  {:event-agent "test"
                   :entity-id "1234"
                   :time-occurred (jt/instant)
                   :event-data {:hello "event2"}
                   :revision 1}]
          result (store/persist! (:ds-opts @db-mock/db) events)
          first-event (first result)
          second-event (second result)]
      ;; first event
      (t/is (uuid/uuidable? (:event-journal/entity-id first-event)))
      (t/is (some? (:event-journal/time-occurred first-event)))
      (t/is (= (:event-journal/event-data first-event) {:hello "world"}))
      ;; second event
      (t/is (= (:event-journal/entity-id second-event) "1234"))
      (t/is (= (jt/to-millis-from-epoch (:event-journal/time-occurred second-event))
               (jt/to-millis-from-epoch (:time-occurred (second events)))))
      (t/is (= (:event-journal/event-data second-event) {:hello "event2"})))))

(t/deftest ^:unit count-by-entity-id
  (t/testing "number of events"
    (let [events [{:event-agent "test"
                   :event-data {:hello "world"}
                   :revision 1}]
          result (store/persist! (:ds-opts @db-mock/db) events)
          count (store/count-by-entity-id (:ds-opts @db-mock/db) (:event-journal/entity-id (first result)))]
      (t/is (= count 1)))))

(t/deftest ^:unit load-by-entity-id
  (t/testing "without snapshots"
    (let [entity-id (str (uuid/v7))
          events [{:event-agent "test"
                   :entity-id entity-id
                   :event-data {:hello "world"}
                   :revision 1}
                  {:event-agent "test"
                   :entity-id entity-id
                   :event-data {:hello "world1234"}
                   :revision 2}]
          _ (store/persist! (:ds-opts @db-mock/db) events)
          events (store/load-by-entity-id (:ds-opts @db-mock/db) entity-id)]
      (t/is (= (count events) 2))
      (t/is (= (:revision (first events)) 1))
      (t/is (= (:revision (second events)) 2))))
  (t/testing "with snapshots"
    (let [entity-id (str (uuid/v7))
          events [{:event-agent "test"
                   :entity-id entity-id
                   :event-data {:hello "world"}
                   :revision 1}
                  {:event-agent "test"
                   :entity-id entity-id
                   :event-data {:hello "world1234"}
                   :revision 2}
                  {:event-agent (:snapshot agents/system-agents)
                   :entity-id entity-id
                   :event-data {:hello "world1234"}
                   :revision 3}
                  {:event-agent "test"
                   :entity-id entity-id
                   :event-data {:hello "world4321"}
                   :revision 4}]
          _ (store/persist! (:ds-opts @db-mock/db) events)
          events (store/load-by-entity-id (:ds-opts @db-mock/db) entity-id)]
      (t/is (some #(= (:event-agent %) (:snapshot agents/system-agents)) events))
      (t/is (= (count events) 2))
      (t/is (= (:revision (first events)) 3))
      (t/is (= (:revision (second events)) 4)))))

(t/deftest ^:unit load-by-entity-id-and-revision
  (t/testing "without snapshots"
    (let [entity-id (str (uuid/v7))
          events [{:event-agent "test"
                   :entity-id entity-id
                   :event-data {:hello "world"}
                   :revision 1}
                  {:event-agent "test"
                   :entity-id entity-id
                   :event-data {:hello "world1234"}
                   :revision 2}
                  {:event-agent "test"
                   :entity-id entity-id
                   :event-data {:hello "world4321"}
                   :revision 3}]
          _ (store/persist! (:ds-opts @db-mock/db) events)
          events (store/load-by-entity-id-and-revision (:ds-opts @db-mock/db) entity-id 2)]
      (t/is (= (count events) 2))
      (t/is (= (:revision (first events)) 1))
      (t/is (= (:revision (second events)) 2))))
  (t/testing "with snapshots"
    (let [entity-id (str (uuid/v7))
          events [{:event-agent "test"
                   :entity-id entity-id
                   :event-data {:hello "world"}
                   :revision 1}
                  {:event-agent "test"
                   :entity-id entity-id
                   :event-data {:hello "world1234"}
                   :revision 2}
                  {:event-agent (:snapshot agents/system-agents)
                   :entity-id entity-id
                   :event-data {:hello "world1234"}
                   :revision 3}
                  {:event-agent "test"
                   :entity-id entity-id
                   :event-data {:hello "world4321"}
                   :revision 4}]
          _ (store/persist! (:ds-opts @db-mock/db) events)
          events (store/load-by-entity-id-and-revision (:ds-opts @db-mock/db) entity-id 2)]
      (t/is (not (some #(= (:event-agent %) (:snapshot agents/system-agents)) events)))
      (t/is (= (count events) 2))
      (t/is (= (:revision (first events)) 1))
      (t/is (= (:revision (second events)) 2)))))

(t/deftest ^:unit load-by-entity-ids
  (t/testing "without snapshots"
    (let [first-entity-id (str (uuid/v7))
          second-entity-id (str (uuid/v7))
          events [{:event-agent "test"
                   :entity-id first-entity-id
                   :event-data {:hello "world"}
                   :revision 1}
                  {:event-agent "test"
                   :entity-id first-entity-id
                   :event-data {:hello "world1234"}
                   :revision 2}
                  {:event-agent "test"
                   :entity-id first-entity-id
                   :event-data {:hello "world4321"}
                   :revision 3}
                  {:event-agent "test2"
                   :entity-id second-entity-id
                   :event-data {:hello "world"}
                   :revision 1}
                  {:event-agent "test2"
                   :entity-id second-entity-id
                   :event-data {:hello "world1234"}
                   :revision 2}
                  {:event-agent "test2"
                   :entity-id second-entity-id
                   :event-data {:hello "world4321"}
                   :revision 3}]
          _ (store/persist! (:ds-opts @db-mock/db) events)
          events (store/load-by-entity-ids (:ds-opts @db-mock/db) [first-entity-id second-entity-id])]
      (t/is (= (count events) 6))
      (t/is (= (:revision (first events)) 1))
      (t/is (= (:revision (nth events 2)) 3))
      (t/is (= (:revision (nth events 3)) 1))
      (t/is (= (:revision (nth events 5)) 3))))
  (t/testing "with snapshots"
    (let [first-entity-id (str (uuid/v7))
          second-entity-id (str (uuid/v7))
          first-entity-events [{:event-agent "test"
                                :entity-id first-entity-id
                                :event-data {:hello "world"}
                                :revision 1}
                               {:event-agent "test"
                                :entity-id first-entity-id
                                :event-data {:hello "world1234"}
                                :revision 2}
                               {:event-agent (:snapshot agents/system-agents)
                                :entity-id first-entity-id
                                :event-data {:hello "world1234"}
                                :revision 3}
                               {:event-agent "test"
                                :entity-id first-entity-id
                                :event-data {:hello "world4321"}
                                :revision 4}]
          second-entity-events [{:event-agent "test"
                                 :entity-id second-entity-id
                                 :event-data {:hello "world"}
                                 :revision 1}
                                {:event-agent (:snapshot agents/system-agents)
                                 :entity-id second-entity-id
                                 :event-data {:hello "world"}
                                 :revision 2}
                                {:event-agent "test"
                                 :entity-id second-entity-id
                                 :event-data {:hello "world4321"}
                                 :revision 3}]
          events (into first-entity-events second-entity-events)
          _ (store/persist! (:ds-opts @db-mock/db) events)
          events (store/load-by-entity-ids (:ds-opts @db-mock/db) [first-entity-id second-entity-id])]
      (t/is (some #(= (:event-agent %) (:snapshot agents/system-agents)) events))
      (t/is (= (count events) 4))
      (t/is (= (:revision (first events)) 3))
      (t/is (= (:revision (second events)) 4))
      (t/is (= (:revision (nth events 2)) 2))
      (t/is (= (:revision (nth events 3)) 3)))))
