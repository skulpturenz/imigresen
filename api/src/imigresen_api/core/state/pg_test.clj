(ns imigresen-api.core.state.pg-test
  (:require
   [clojure.test]
   [imigresen-api.core.state.pg]
   [clojure.set]))

(def connection-strings {"postgresql://user:password@test-pg.com:12345/test-database?sslmode=require" {:host "test-pg.com"
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
                                                     :use-ssl false}})

(clojure.test/deftest create-config-valid-connection-string
  (clojure.test/testing "create config from connection string"
    (clojure.test/is (= (set (map imigresen-api.core.state.pg/create-config (keys connection-strings))) (set (vals connection-strings))))))
