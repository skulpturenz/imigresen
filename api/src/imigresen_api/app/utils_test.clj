(ns imigresen-api.app.utils-test
  (:require [imigresen-api.app.utils :refer [caught truthy]]
            [clojure.test :as t]
            [clojure.core.match :refer [match]]
            [clojure.string :as str])
  (:import
   (java.net URI)))

(t/deftest ?caught
  (t/testing "caught"
    (t/is (= (match (caught (first (str/split (.getUserInfo (URI. "")) #":")))
               "hello" :success
               :else :failure)
             :failure))
    (t/is (= (match (caught (first (str/split (.getUserInfo (URI. "postgresql://hello:password@test-pg.com:12345/?sslmode=prefer")) #":")))
               "hello" :success
               :else :failure)
             :success))))

(t/deftest ?truthy
  (t/testing "returns first truthy value"
    (t/is (= (truthy nil 1 nil 2 nil 3) 1))))
