(ns skulpture-eventing.entity-utils.apply-test
  (:require [clojure.test :as t]
            [skulpture-eventing.entity-utils.apply :as apply]))

(t/deftest ^:unit aggregate
  (t/testing "reduces result"
    (let [transformer (fn
                        ([] {})
                        ([acc] acc)
                        ([acc {:keys [type] :as event}]
                         (case type
                           :a {:x (+ (:x event) (or (:x acc) 0))}
                           :b {:x (+ (:x event) (or (:x acc) 0) 2)})))
          result (apply/aggregate transformer [{:type :b :x 2 :revision 1}
                                               {:type :a :x 1 :revision 2}])]
      ;; 2 + 1 + 2
      (t/is (= (:x result) 5))))
  (t/testing "revision asc"
    (let [transformer (fn
                        ([] {})
                        ([acc] acc)
                        ([acc {:keys [type] :as event}]
                         (case type
                           :a {:x (/ (:x event) (or (:x acc) 1))})))
          result (apply/aggregate transformer [{:type :a :x 2 :revision 1}
                                               {:type :a :x 1 :revision 2}
                                               {:type :a :x 3 :revision 3}])]
      ;; revision 1 = (2 / 1) = 2
      ;; revision 2 = (1 / revision 1) = 0.5
      ;; revision 3 = (3 / revision 2) = 6
      (t/is (= (:x result) 6)))))

(t/deftest ^:unit next-revision
  (t/testing "+ 1"
    (let [next-revision (apply/next-revision {:revision Long/MAX_VALUE})]
      (t/is (= next-revision (+ (bigint 1) Long/MAX_VALUE))))))

(t/deftest ^:unit latest-revision
  (t/testing "latest revision from unsorted events"
    (let [latest-revision (apply/latest-revision [{:revision 3}
                                                  {:revision 4}
                                                  {:revision 5}
                                                  {:revision 1}])]
      (t/is (= latest-revision 5)))))

(t/deftest ^:unit valid-stream?
  (t/testing "false if latest revision neq number of events"
    (let [valid? (apply/valid-stream? [{:revision 2}
                                       {:revision 3}])]
      (t/is (false? valid?)))
    (let [valid? (apply/valid-stream? [{:revision 1}
                                       {:revision 2}])]
      (t/is (true? valid?))))
  (t/testing "false if revision is not sequential"
    (let [valid? (apply/valid-stream? [{:revision 1}
                                       {:revision 1}
                                       {:revision 3}])]
      (t/is (false? valid?)))
    (let [valid? (apply/valid-stream? [{:revision 1}
                                       {:revision 2}
                                       {:revision 3}])]
      (t/is (true? valid?)))))
