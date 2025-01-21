(ns imigresen-api.state.pg.core-test
  (:require
   [clojure.test]
   [imigresen-api.state.pg.core]
   [clojure.set]))

(clojure.test/deftest parse-uri
  (clojure.test/testing "parses postgres uri"
    (let [connection-strings {"postgresql://user:password@test-pg.com:12345/test-database?sslmode=require" {:host "test-pg.com"
                                                                                                            :port 12345
                                                                                                            :user "user"
                                                                                                            :password "password"
                                                                                                            :database "test-database"
                                                                                                            :use-ssl true}
                              "postgresql://user:password@test-pg.com:12345/?sslmode=prefer" {:host "test-pg.com"
                                                                                              :port 12345
                                                                                              :user "user"
                                                                                              :password "password"
                                                                                              :database ""
                                                                                              :use-ssl true}
                              "postgresql://test-pg.com:12345/" {:host "test-pg.com"
                                                                 :port 12345
                                                                 :user ""
                                                                 :password ""
                                                                 :database ""
                                                                 :use-ssl false}
                              "postgresql://test-pg.com" {:host "test-pg.com"
                                                          :port 5432
                                                          :user ""
                                                          :password ""
                                                          :database ""
                                                          :use-ssl false}}]
      (clojure.test/is (= (map imigresen-api.state.pg.core/parse-uri (keys connection-strings)) (vals connection-strings))))))

(clojure.test/deftest ssl-modes
  (clojure.test/testing "ssl modes"
    (let [ssl-modes {"disable" false
                     "allow" false
                     "prefer" true
                     "require" true
                     "verify-ca" true
                     "verify-full" true
                     "invalid" false}]
      (clojure.test/is (= (map imigresen-api.state.pg.core/use-ssl (keys ssl-modes)) (vals ssl-modes))))))
