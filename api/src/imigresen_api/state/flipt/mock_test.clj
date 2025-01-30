(ns imigresen-api.state.flipt.mock-test
  (:require [imigresen-api.state.flipt.mock :refer [flipt with-mock boolean-evaluation variant-evaluation]]
            [imigresen-api.state.flipt.core :refer [enabled? variant]]
            [clojure.test :as t]
            [mount.core :as mount]
            [muuntaja.core :refer [decode]]
            [imigresen-api.app.routes :refer [status-codes]]))

(defn fixture [f]
  (mount/start #'imigresen-api.state.flipt.mock/flipt)
  (f)
  (mount/stop #'imigresen-api.state.flipt.mock/flipt))

(t/use-fixtures :once fixture)

(t/deftest boolean-mock-enabled
  (t/testing "boolean evaluation"
    (with-mock (boolean-evaluation true)
      (t/is (enabled? (:client @flipt) "test" "default" {})))))

(t/deftest variant-mock-enabled
  (t/testing "variant evaluation"
    (let [res (fn [_req opts _cb]
                (variant-evaluation true "test" nil (:requestId (decode "application/json" (:body opts)))))]
      (with-mock (variant-evaluation res)
        (t/is (:match (variant (:client @flipt) "test" "default" {})))))))

(t/deftest boolean-mock-bad-req
  (t/testing "boolean evaluation"
    (with-mock (boolean-evaluation (constantly {:status (:bad-request status-codes)}))
      (t/is (nil? (enabled? (:client @flipt) "test" "default" {}))))))

(t/deftest variant-mock-bad-req
  (t/testing "boolean evaluation"
    (with-mock (boolean-evaluation (constantly {:status (:bad-request status-codes)}))
      (t/is (nil? (variant (:client @flipt) "test" "default" {}))))))
