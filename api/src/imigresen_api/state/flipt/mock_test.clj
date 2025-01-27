(ns imigresen-api.state.flipt.mock-test
  (:require [imigresen-api.state.flipt.core :refer [evaluate-boolean evaluation-request enabled?]]
            [imigresen-api.state.flipt.mock :refer [flipt create-mock-flipt-client evaluation-reason evaluation-response]]
            [clojure.test :as t]
            [mount.core :as mount]))

(defn fixture [f]
  (mount/start #'imigresen-api.state.flipt.mock/flipt)
  (f)
  (mount/stop #'imigresen-api.state.flipt.mock/flipt))

(t/use-fixtures :once fixture)

;; TODO `Evaluation` has private constructor
(t/deftest evaluate
  (t/testing "able to evaluate"
    (let [resolver (fn [_req] (evaluation-response true "test" (evaluation-reason) 100 "100"))
          client (create-mock-flipt-client {:default {:test resolver}})
          agent (flipt client)]
      ;; TODO: class io.flipt.api.evaluation.models.BooleanEvaluationResponse cannot be cast to class clojure.lang.IFn
      (t/is (enabled? (evaluate-boolean (:client @agent) (evaluation-request "default" "test" "1234" {"hello" "world"} nil)))))))
