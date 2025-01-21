(ns imigresen-api.core.utils-test
  (:require
   [imigresen-api.core.utils]
   [clojure.test]
   [clojure.core.match]
   [clojure.string])
  (:import
   (java.net URI)))

(clojure.test/deftest comptime-fn
  (clojure.test/testing "comptime fn n-args"
    (clojure.test/is (= (imigresen-api.core.utils/comptime + 1 2 3 4 5) (+ 1 2 3 4 5)))))

(clojure.test/deftest comptime-list
  (clojure.test/testing "comptime list eval"
    (clojure.test/is (= (imigresen-api.core.utils/comptime (+ 1 2 3 4 5)) (+ 1 2 3 4 5)))
    (clojure.test/is (= (imigresen-api.core.utils/comptime '(1 2 3 4 5)) '(1 2 3 4 5)))))

(clojure.test/deftest comptime-primitive
  (clojure.test/testing "comptime primitive"
    (clojure.test/is (= (imigresen-api.core.utils/comptime 1) 1))
    ;; bad input
    (clojure.test/is (= (imigresen-api.core.utils/comptime 1 2 3) 1))))

(clojure.test/deftest caught-match
  (clojure.test/testing "caught"
    (clojure.test/is (=
                      (clojure.core.match/match
                       (imigresen-api.core.utils/caught (first (clojure.string/split (.getUserInfo (URI. "")) #":")))
                        "hello" :success
                        :else :failure)
                      :failure))
    (clojure.test/is (=
                      (clojure.core.match/match
                       (imigresen-api.core.utils/caught
                        (first
                         (clojure.string/split
                          (.getUserInfo (URI. "postgresql://hello:password@test-pg.com:12345/?sslmode=prefer")) #":")))
                        "hello" :success
                        :else :failure)
                      :success))))
