(ns skulpture-eventing.entity.constraints-test
  (:require [clojure.test :as t]
            [skulpture-eventing.entity.constraints :as constraints]))

(t/deftest ^:unit where
  (t/testing "basic"
    (let [query (constraints/where {:include-event-types      ["user_created" "user_updated"]
                                    :exclude-with-event-types ["user_deleted"]})]
      (t/is (= query {:select-distinct :entity-id
                      :from            :event-journal
                      :where           [:and
                                        [:not-in {:select :entity-id
                                                  :from   :event-journal
                                                  :where  [:and
                                                           [:in [:->> :event-data "type"] ["user_deleted"]]]}]
                                        [:in [:->> :event-data "type"] ["user_created" "user_updated"]]]}))))
  (t/testing "without exclusions"
    (let [query (constraints/where {:include-event-types ["user_created" "user_updated"]})]
      (t/is (= query {:select-distinct :entity-id
                      :from            :event-journal
                      :where           [:and
                                        [:in [:->> :event-data "type"] ["user_created" "user_updated"]]]}))))
  (t/testing "with additional inclusion criteria"
    (let [query (constraints/where {:include-event-types        ["user_created" "user_updated"]
                                    :additional-include-filters [[:in :entity-id [1 2 3]]]
                                    :exclude-with-event-types   ["user_deleted"]})]
      (t/is (= query {:select-distinct :entity-id
                      :from            :event-journal
                      :where           [:and
                                        [:not-in {:select :entity-id
                                                  :from   :event-journal
                                                  :where  [:and
                                                           [:in [:->> :event-data "type"] ["user_deleted"]]]}]
                                        [:in [:->> :event-data "type"] ["user_created" "user_updated"]]
                                        [:in :entity-id [1 2 3]]]}))))
  (t/testing "with additional exclusion criteria"
    (let [query (constraints/where {:include-event-types        ["user_created" "user_updated"]
                                    :additional-include-filters [[:in :entity-id [1 2 3]]]
                                    :exclude-with-event-types   ["user_deleted"]
                                    :additional-exclude-filters [[:in :entity-id [4 5 6]]]})]
      (t/is (= query {:select-distinct :entity-id
                      :from            :event-journal
                      :where           [:and
                                        [:not-in {:select :entity-id
                                                  :from   :event-journal
                                                  :where  [:and
                                                           [:in [:->> :event-data "type"] ["user_deleted"]]
                                                           [:in :entity-id [4 5 6]]]}]
                                        [:in [:->> :event-data "type"] ["user_created" "user_updated"]]
                                        [:in :entity-id [1 2 3]]]}))))
  (t/testing "without excluding by event type, with additional exclusion criteria"
    (let [query (constraints/where {:include-event-types        ["user_created" "user_updated"]
                                    :additional-include-filters [[:in :entity-id [1 2 3]]]
                                    :additional-exclude-filters [[:in :entity-id [4 5 6]]]})]
      (t/is (= query {:select-distinct :entity-id
                      :from            :event-journal
                      :where           [:and
                                        [:not-in {:select :entity-id
                                                  :from   :event-journal
                                                  :where  [:and
                                                           [:in :entity-id [4 5 6]]]}]
                                        [:in [:->> :event-data "type"] ["user_created" "user_updated"]]
                                        [:in :entity-id [1 2 3]]]})))))

(t/deftest ^:unit has
  (t/testing "basic"
    (let [query (constraints/has {:include-event-types      ["user_created" "user_updated"]
                                  :exclude-with-event-types ["user_deleted"]})]
      (t/is (= query {:select [[:1 :'has]]
                      :from   :event-journal
                      :where  [:and
                               [:not-in {:select :entity-id
                                         :from   :event-journal
                                         :where  [:and
                                                  [:in [:->> :event-data "type"] ["user_deleted"]]]}]
                               [:in [:->> :event-data "type"] ["user_created" "user_updated"]]]
                      :limit  1}))))
  (t/testing "without exclusions"
    (let [query (constraints/has {:include-event-types ["user_created" "user_updated"]})]
      (t/is (= query {:select [[:1 :'has]]
                      :from   :event-journal
                      :where  [:and
                               [:in [:->> :event-data "type"] ["user_created" "user_updated"]]]
                      :limit  1}))))
  (t/testing "with additional inclusion criteria"
    (let [query (constraints/has {:include-event-types        ["user_created" "user_updated"]
                                  :additional-include-filters [[:in :entity-id [1 2 3]]]
                                  :exclude-with-event-types   ["user_deleted"]})]
      (t/is (= query {:select [[:1 :'has]]
                      :from   :event-journal
                      :where  [:and
                               [:not-in {:select :entity-id
                                         :from   :event-journal
                                         :where  [:and
                                                  [:in [:->> :event-data "type"] ["user_deleted"]]]}]
                               [:in [:->> :event-data "type"] ["user_created" "user_updated"]]
                               [:in :entity-id [1 2 3]]]
                      :limit  1}))))
  (t/testing "with additional exclusion criteria"
    (let [query (constraints/has {:include-event-types        ["user_created" "user_updated"]
                                  :additional-include-filters [[:in :entity-id [1 2 3]]]
                                  :exclude-with-event-types   ["user_deleted"]
                                  :additional-exclude-filters [[:in :entity-id [4 5 6]]]})]
      (t/is (= query {:select [[:1 :'has]]
                      :from   :event-journal
                      :where  [:and
                               [:not-in {:select :entity-id
                                         :from   :event-journal
                                         :where  [:and
                                                  [:in [:->> :event-data "type"] ["user_deleted"]]
                                                  [:in :entity-id [4 5 6]]]}]
                               [:in [:->> :event-data "type"] ["user_created" "user_updated"]]
                               [:in :entity-id [1 2 3]]]
                      :limit  1}))))
  (t/testing "without excluding by event type, with additional exclusion criteria"
    (let [query (constraints/has {:include-event-types        ["user_created" "user_updated"]
                                  :additional-include-filters [[:in :entity-id [1 2 3]]]
                                  :additional-exclude-filters [[:in :entity-id [4 5 6]]]})]
      (t/is (= query {:select [[:1 :'has]]
                      :from   :event-journal
                      :where  [:and
                               [:not-in {:select :entity-id
                                         :from   :event-journal
                                         :where  [:and
                                                  [:in :entity-id [4 5 6]]]}]
                               [:in [:->> :event-data "type"] ["user_created" "user_updated"]]
                               [:in :entity-id [1 2 3]]]
                      :limit  1})))))

(t/deftest ^:unit create-migration
  (t/testing "transforms aggregates to constraint rows"
    (let [aggregates [{:a 1 :b 1} {:a 2 :b 2} {:a 3 :b 3}]
          query (constraints/create-migration :test-constraints aggregates identity)]
      (t/is (= query {:insert-into :test-constraints
                      :values      aggregates
                      :returning   :*})))))

(t/deftest ^:unit create-events
  (t/testing "transforms constraint rows to events"
    (let [constraints [{:a 1 :b 1} {:a 2 :b 2} {:a 3 :b 3}]
          query (constraints/create-events constraints #(vector {:entity-id (:a %) :other-id (:b %)}))]
      (t/is (= query {:insert-into :event-journal
                      :values      [{:entity-id 1 :other-id 1}
                                    {:entity-id 2 :other-id 2}
                                    {:entity-id 3 :other-id 3}]
                      :returning   :*})))))