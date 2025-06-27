(ns imigresen-api.app.core-test
  (:require [clojure.test :as t]
            [imigresen-api.app.core :as imi-core]
            [imigresen-common.app.routes :as imi-routes]
            [muuntaja.core :as m]
            [ring.mock.request :as mock]))

(t/deftest ^:unit response->camelCase
  (t/testing "camelCase response keys"
    (let [app (imi-core/create-app
               [["/parameters/:test-path-param" {:post {:description "parameters"
                                                        :parameters {:path {:test-path-param int?}
                                                                     :query {:test-search-param string?}
                                                                     :body {:hello-world string?}}
                                                        :responses {(:ok imi-routes/status-codes) {:description "Success!"
                                                                                                   :body {:hello string?}}}
                                                        :handler (constantly {:body {:some-return "TEST!!"}})}}]])
          body (m/decode "application/json" (-> (mock/request :post "/parameters/1")
                                                (mock/query-string {:testSearchParam "TESTING TESTING"})
                                                (mock/json-body {:helloWorld "HELLO WORLD!!!"})
                                                app
                                                :body))]
      (t/is (= (:someReturn body) "TEST!!")))))

(t/deftest ^:unit request->kebab-case-keyword
  (t/testing "kebab-case-keyword request keys"
    (let [app (imi-core/create-app
               [["/parameters/:test-path-param" {:post {:description "parameters"
                                                        :parameters {:path {:test-path-param int?}
                                                                     :query {:test-search-param string?}
                                                                     :body {:hello-world string?}}
                                                        :responses {(:ok imi-routes/status-codes) {:description "Success!"
                                                                                                   :body {:hello string?}}}
                                                        :handler identity}}]])
          res (-> (mock/request :post "/parameters/1")
                  (mock/query-string {:testSearchParam "TESTING TESTING"})
                  (mock/json-body {:helloWorld "HELLO WORLD!!!"})
                  app)]
      (t/is (not (nil? res))))))

(t/deftest ^:unit exception-handling
  (t/testing "exception middleware"))

(t/deftest ^:unit with-authnz
  (t/testing "with-authnz middleware"))

(t/deftest ^:unit content-type-negotiation
  (t/testing "content-type negotiation"))

(t/deftest ^:unit openapi-definitions
  (t/testing "openapi"
    (let [app (imi-core/create-app
               [["/parameters" {:post {:description "parameters"
                                       :parameters {:path {:test-path-param int?}
                                                    :query {:test-search-param string?}
                                                    :body {:hello-world string?}}
                                       :responses {(:ok imi-routes/status-codes) {:description "Success!"
                                                                                  :body {:hello string?}}}
                                       :handler identity}}]])
          res (->> (mock/request :get "/openapi.json")
                   app
                   :body
                   (m/decode "application/json"))
          params (get-in res [:paths (keyword "/parameters") :post :parameters])
          req-body (get-in res [:paths
                                (keyword "/parameters")
                                :post :requestBody
                                :content
                                (keyword "application/json")
                                :schema
                                :properties])]
      (t/is (some #(and (= (:in %) "path") (= (:name %) "testPathParam")) params))
      (t/is (some #(and (= (:in %) "query") (= (:name %) "testSearchParam")) params))
      (t/is (not (nil? (:helloWorld req-body)))))))

(t/deftest ^:unit search-params
  (t/testing "search params"))

(t/deftest ^:unit route-params
  (t/testing "route params"))

(t/deftest ^:unit form-params
  (t/testing "form params"))
