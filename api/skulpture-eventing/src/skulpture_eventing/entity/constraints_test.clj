(ns skulpture-eventing.entity.constraints-test
  (:require [skulpture-eventing.entity.constraints :as constraints]
            [clojure.test :as t]))

(t/deftest ^:unit where
  (t/testing "basic"
    (let [query (constraints/where {:include-event-types ["user_created" "user_updated"]
                                    :exclude-with-event-types ["user_deleted"]})]
      (t/is (= query {:select :entity-id
                      :from :event-journal
                      :where [:and
                              [:in [:->> :event-data "type"] ["user_created" "user_updated"]]
                              [:not-in {:select :entity-id
                                        :from :event-journal
                                        :where [:and
                                                [:in [:->> :event-data "type"] ["user_deleted"]]]}]]}))))
  (t/testing "without exclusions"
    (let [query (constraints/where {:include-event-types ["user_created" "user_updated"]})]
      (t/is (= query {:select :entity-id
                      :from :event-journal
                      :where [:and
                              [:in [:->> :event-data "type"] ["user_created" "user_updated"]]]}))))
  (t/testing "with additional inclusion criteria"
    (let [query (constraints/where {:include-event-types ["user_created" "user_updated"]
                                    :additional-include-filters [[:in :entity-id [1 2 3]]]
                                    :exclude-with-event-types ["user_deleted"]})]
      (t/is (= query {:select :entity-id
                      :from :event-journal
                      :where [:and
                              [:in [:->> :event-data "type"] ["user_created" "user_updated"]]
                              [:in :entity-id [1 2 3]]
                              [:not-in {:select :entity-id
                                        :from :event-journal
                                        :where [:and
                                                [:in [:->> :event-data "type"] ["user_deleted"]]]}]]}))))
  (t/testing "with additional exclusion criteria"
    (let [query (constraints/where {:include-event-types ["user_created" "user_updated"]
                                    :additional-include-filters [[:in :entity-id [1 2 3]]]
                                    :exclude-with-event-types ["user_deleted"]
                                    :additional-exclude-filters [[:in :entity-id [4 5 6]]]})]
      (t/is (= query {:select :entity-id
                      :from :event-journal
                      :where [:and
                              [:in [:->> :event-data "type"] ["user_created" "user_updated"]]
                              [:in :entity-id [1 2 3]]
                              [:not-in {:select :entity-id
                                        :from :event-journal
                                        :where [:and
                                                [:in [:->> :event-data "type"] ["user_deleted"]]
                                                [:in :entity-id [4 5 6]]]}]]}))))
  (t/testing "without excluding by event type, with additional exclusion criteria"
    (let [query (constraints/where {:include-event-types ["user_created" "user_updated"]
                                    :additional-include-filters [[:in :entity-id [1 2 3]]]
                                    :additional-exclude-filters [[:in :entity-id [4 5 6]]]})]
      (t/is (= query {:select :entity-id
                      :from :event-journal
                      :where [:and
                              [:in [:->> :event-data "type"] ["user_created" "user_updated"]]
                              [:in :entity-id [1 2 3]]
                              [:not-in {:select :entity-id
                                        :from :event-journal
                                        :where [:and
                                                [:in :entity-id [4 5 6]]]}]]})))))
