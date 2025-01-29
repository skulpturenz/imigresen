(ns imigresen-api.state.flipt.mock-test
  (:require [imigresen-api.state.flipt.mock :refer [flipt with-mock boolean-evaluation variant-evaluation]]
            [imigresen-api.state.flipt.core :refer [enabled? variant]]
            [clojure.test :as t]
            [mount.core :as mount]))

(defn fixture [f]
  (mount/start #'imigresen-api.state.flipt.mock/flipt)
  (f)
  (mount/stop #'imigresen-api.state.flipt.mock/flipt))

(t/use-fixtures :once fixture)

(t/deftest boolean-mock
  (t/testing "boolean evaluation"
    (with-mock (boolean-evaluation true)
      (t/is (enabled? (:client @flipt) "test" "default" {})))))

(t/deftest variant-mock
  (t/testing "variant evaluation"
    (with-mock (variant-evaluation true "test" nil)
      (t/is (:match (variant (:client @flipt) "test" "default" {}))))))
