(ns imigresen-api.core.env-test
  (:require [clojure.test]))

(clojure.test/deftest get-env-value
  (clojure.test/testing "gets env value"
    (clojure.test/is (= 0 1))))

(clojure.test/deftest spec
  (clojure.test/testing "validates against spec"
    (clojure.test/is (= 0 1))))

(clojure.test/deftest default-value
  (clojure.test/testing "provide default value"
    (clojure.test/is (= 0 1))))
