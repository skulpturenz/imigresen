(ns imigresen-api.state.flipt.mock-test
  (:require [imigresen-api.state.flipt.core :refer [evaluate-boolean evaluation-request enabled?]]
            [imigresen-api.state.flipt.mock :refer [flipt create-mock-flipt-client evaluation-reason evaluation-response]]
            [clojure.test :as t]
            [mount.core :as mount]))

(defn fixture [f]
  (mount/start #'imigresen-api.state.flipt.mock/flipt)
  (let [resolver (fn [] (evaluation-response true "test" (evaluation-reason "testing!!") 100 100))
        client (create-mock-flipt-client {:default {:test resolver}})]
    (@flipt client))
  (f)
  (mount/stop #'imigresen-api.state.flipt.mock/flipt))

(t/use-fixtures :once fixture)

;; TODO `Evaluation` has private constructor
(t/deftest evaluate
  (t/testing "able to evaluate"
    (t/is (enabled? (evaluate-boolean (:client @flipt) (evaluation-request "default" "test" 1 nil))))))
