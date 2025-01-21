(ns imigresen-api.app.utils-test
  (:require
   [imigresen-api.app.utils :refer [caught comptime]]
   [clojure.test :as t]
   [clojure.core.match :refer [match]]
   [clojure.string :as str])
  (:import
   (java.net URI)))

(t/deftest comptime-fn
  (t/testing "comptime fn n-args"
    (t/is (= (comptime + 1 2 3 4 5) (+ 1 2 3 4 5)))))

(t/deftest comptime-list
  (t/testing "comptime list eval"
    (t/is (= (comptime (+ 1 2 3 4 5)) (+ 1 2 3 4 5)))
    (t/is (= (comptime '(1 2 3 4 5)) '(1 2 3 4 5)))))

(t/deftest comptime-primitive
  (t/testing "comptime primitive"
    (t/is (= (comptime 1) 1))
    ;; bad input
    (t/is (= (comptime 1 2 3) 1))))

(t/deftest caught-match
  (t/testing "caught"
    (t/is (= (match (caught (first (str/split (.getUserInfo (URI. "")) #":")))
               "hello" :success
               :else :failure)
             :failure))
    (t/is (= (match (caught (first (str/split (.getUserInfo (URI. "postgresql://hello:password@test-pg.com:12345/?sslmode=prefer")) #":")))
               "hello" :success
               :else :failure)
             :success))))
