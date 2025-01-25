(ns imigresen-api.app.env-test
  (:require [clojure.test :as t]
            [environ.core]
            [clojure.java.io]
            [imigresen-api.app.env]
            [clojure.spec.alpha :as s]
            [clojure.edn :refer [read-string]]))

(defn refresh-ns []
  (remove-ns 'environ.core)
  (remove-ns 'imigresen-api.app.env)
  (dosync (alter @#'clojure.core/*loaded-libs* disj 'environ.core))
  (dosync (alter @#'clojure.core/*loaded-libs* disj 'imigresen-api.app.env))
  (require 'environ.core)
  (require 'imigresen-api.app.env))

(defn refresh-env []
  (refresh-ns)
  (var-get (find-var 'imigresen-api.app.env/env)))

(defn delete-file [file]
  (.delete (clojure.java.io/file file)))

(defn set-env [env]
  (doseq [kv env] (System/setProperty (name (key kv)) (str (val kv)))))

(defn clear-env [& env]
  (doseq [k env] (System/clearProperty (name k))))

(t/deftest get-env-value
  (t/testing "gets env value"
    (set-env {:get-env-value "world"})
    (let [env (refresh-env)]
      (t/is (= (env :get-env-value) "world")))
    (clear-env :get-env-value)))

(t/deftest spec
  (t/testing "validates against spec"
    (set-env {:spec 1})
    (let [env (refresh-env)]
      (t/is (thrown? Exception (env :spec number?) 1))
      (t/is (= (env :spec (s/and string? (s/conformer #(read-string %)) number?)) 1)))
    (clear-env :spec)))

(t/deftest default-value
  (t/testing "provide default value"
    (let [env (refresh-env)]
      (t/is (= (env :default-value string? "hello world") "hello world"))
      (t/is (thrown? Exception (env :default-value (s/and string? (s/conformer #(read-string %)) number?) "wewerwerg"))))))
