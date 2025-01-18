(ns imigresen-api.core.env-test
  (:require [clojure.test]
            [environ.core]
            [clojure.java.io]
            [imigresen-api.core.env]
            [clojure.spec.alpha]
            [clojure.edn]))

(defn refresh-ns []
  (remove-ns 'environ.core)
  (remove-ns 'imigresen-api.core.env)
  (dosync (alter @#'clojure.core/*loaded-libs* disj 'environ.core))
  (dosync (alter @#'clojure.core/*loaded-libs* disj 'imigresen-api.core.env))
  (require 'environ.core)
  (require 'imigresen-api.core.env))

(defn refresh-env []
  (refresh-ns)
  (var-get (find-var 'imigresen-api.core.env/env)))

(defn delete-file [file]
  (.delete (clojure.java.io/file file)))

(defn set-env [env]
  (doseq [kv env] (System/setProperty (name (key kv)) (str (val kv)))))

(clojure.test/deftest get-env-value
  (clojure.test/testing "gets env value"
    (set-env {:get-env-value "world"})
    (let [env (refresh-env)]
      (clojure.test/is (= (env :get-env-value) "world")))))

(clojure.test/deftest spec
  (clojure.test/testing "validates against spec"
    (set-env {:spec 1})
    (let [env (refresh-env)]
      (clojure.test/is (thrown? Exception (env :spec number?) 1))
      (clojure.test/is
       (= (env :spec (clojure.spec.alpha/and string? (clojure.spec.alpha/conformer #(clojure.edn/read-string %)))) 1)))))

(clojure.test/deftest default-value
  (clojure.test/testing "provide default value"
    (let [env (refresh-env)]
      (clojure.test/is (= (env :default-value string? "hello world") "hello world")))))
