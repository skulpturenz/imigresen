(ns imigresen-api.core.state.pg-test
  (:require
   [clojure.test]
   [imigresen-api.core.state.pg]))

(def connection-string "postgresql://user:password@test-pg.com:12345/test-database?sslmode=require")

(clojure.test/deftest create-config-valid-connection-string
  (clojure.test/testing "create config from connection string"
    (let [config (imigresen-api.core.state.pg/create-config connection-string)]
      (clojure.test/is (= config {:host "test-pg.com"
                                  :port 12345
                                  :user "user"
                                  :password "password"
                                  :database "test-database"
                                  :use-ssl true})))))
