(ns skulpture-eventing.store.adapters.jdbc-test
  (:require [skulpture-eventing.store.adapters.jdbc :as jdbc-store]
            [clojure.test :as t]
            [clj-uuid :as uuid]
            [java-time.api :as jt]
            [skulpture-eventing.store.agents :as agents]
            [skulpture-eventing.test-utils.db.mock :as db-mock]))

(t/deftest ^:unit persist
  (t/testing "persists events"
    (let [store (jdbc-store/create-jdbc-event-store (:ds-opts @db-mock/db))
          events [{:event-agent "test"
                   :event-data {:hello "world"}
                   :revision 1}
                  {:event-agent "test"
                   :entity-id "1234"
                   :time-occurred (jt/instant)
                   :event-data {:hello "event2"}
                   :revision 1}]
          result (.persist! store events)
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
    (let [store (jdbc-store/create-jdbc-event-store (:ds-opts @db-mock/db))
          events [{:event-agent "test"
                   :event-data {:hello "world"}
                   :revision 1}]
          result (.persist! store events)
          count (.count-by-entity-id store (:event-journal/entity-id (first result)))]
      (t/is (= count 1)))))

(t/deftest ^:unit load-by-entity-id
  (t/testing "without snapshots"
    (let [store (jdbc-store/create-jdbc-event-store (:ds-opts @db-mock/db))
          entity-id (str (uuid/v7))
          events [{:event-agent "test"
                   :entity-id entity-id
                   :event-data {:hello "world"}
                   :revision 1}
                  {:event-agent "test"
                   :entity-id entity-id
                   :event-data {:hello "world1234"}
                   :revision 2}]
          _  (.persist! store events)
          events (.load-by-entity-id store entity-id)]
      (t/is (= (count events) 2))
      (t/is (= (:revision (first events)) 1))
      (t/is (= (:revision (second events)) 2))))
  (t/testing "with snapshots"
    (let [store (jdbc-store/create-jdbc-event-store (:ds-opts @db-mock/db))
          entity-id (str (uuid/v7))
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
          _ (.persist! store events)
          events (.load-by-entity-id store entity-id)]
      (t/is (some #(= (:event-agent %) (:snapshot agents/system-agents)) events))
      (t/is (= (count events) 2))
      (t/is (= (:revision (first events)) 3))
      (t/is (= (:revision (second events)) 4)))))

(t/deftest load-by-entity-id-and-revision
  (t/testing "without snapshots"
    (let [store (jdbc-store/create-jdbc-event-store (:ds-opts @db-mock/db))
          entity-id (str (uuid/v7))
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
          _ (.persist! store events)
          events (.load-by-entity-id-and-revision store entity-id 2)]
      (t/is (= (count events) 2))
      (t/is (= (:revision (first events)) 1))
      (t/is (= (:revision (second events)) 2))))
  (t/testing "with snapshots"
    (let [store (jdbc-store/create-jdbc-event-store (:ds-opts @db-mock/db))
          entity-id (str (uuid/v7))
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
          _ (.persist! store events)
          events (.load-by-entity-id-and-revision store entity-id 2)]
      (t/is (not (some #(= (:event-agent %) (:snapshot agents/system-agents)) events)))
      (t/is (= (count events) 2))
      (t/is (= (:revision (first events)) 1))
      (t/is (= (:revision (second events)) 2)))))

(t/deftest load-by-entity-ids
  (t/testing "without snapshots"
    (let [store (jdbc-store/create-jdbc-event-store (:ds-opts @db-mock/db))
          first-entity-id (str (uuid/v7))
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
          _ (.persist! store events)
          events (.load-by-entity-ids store [first-entity-id second-entity-id])]
      (t/is (= (count events) 6))
      (t/is (= (:revision (first events)) 1))
      (t/is (= (:revision (nth events 2)) 3))
      (t/is (= (:revision (nth events 3)) 1))
      (t/is (= (:revision (nth events 5)) 3))))
  (t/testing "with snapshots"
    (let [store (jdbc-store/create-jdbc-event-store (:ds-opts @db-mock/db))
          first-entity-id (str (uuid/v7))
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
          _ (.persist! store events)
          events (.load-by-entity-ids store [first-entity-id second-entity-id])]
      (t/is (some #(= (:event-agent %) (:snapshot agents/system-agents)) events))
      (t/is (= (count events) 4))
      (t/is (= (:revision (first events)) 3))
      (t/is (= (:revision (second events)) 4))
      (t/is (= (:revision (nth events 2)) 2))
      (t/is (= (:revision (nth events 3)) 3)))))
