(ns imigresen-api.core.state.pg-test
  (:require [clojure.test]))

(clojure.test/deftest create-config
  (clojure.test/testing "create config from connection string"
    (clojure.test/is (= 0 1))))
