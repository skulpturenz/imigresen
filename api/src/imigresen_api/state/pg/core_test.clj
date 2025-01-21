(ns imigresen-api.state.pg.core-test
  (:require
   [clojure.test :as t]
   [imigresen-api.state.pg.core :only [parse-uri use-ssl]]
   [clojure.set]))

(t/deftest parse-uris
  (t/testing "parses postgres uri"
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
      (t/is (= (map parse-uri (keys connection-strings)) (vals connection-strings))))))

(t/deftest ssl-modes
  (t/testing "ssl modes"
    (let [ssl-modes {"disable" false
                     "allow" false
                     "prefer" true
                     "require" true
                     "verify-ca" true
                     "verify-full" true
                     "invalid" false}]
      (t/is (= (map use-ssl (keys ssl-modes)) (vals ssl-modes))))))
