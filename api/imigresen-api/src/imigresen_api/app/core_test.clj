(ns imigresen-api.app.core-test
  (:require [clojure.test :as t]
            [imigresen-api.app.core :as imi-core]
            [imigresen-common.app.routes :as imi-routes]
            [muuntaja.core :as m]
            [ring.mock.request :as mock]
            [imigresen-common.app.auth :as imi-auth]))

(t/deftest ^:unit response->camelCase
  (t/testing "camelCase response keys"
    (let [app (imi-core/create-app
               [["/parameters/:test-path-param" {:post {:parameters {:path {:test-path-param int?}
                                                                     :query {:test-search-param string?}
                                                                     :body {:hello-world string?}}
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
               [["/parameters/:test-path-param" {:post {:parameters {:path {:test-path-param int?}
                                                                     :query {:test-search-param string?}
                                                                     :body {:hello-world string?}}
                                                        :handler identity}}]])
          res (-> (mock/request :post "/parameters/1")
                  (mock/query-string {:testSearchParam "TESTING TESTING"})
                  (mock/json-body {:helloWorld "HELLO WORLD!!!"})
                  app)]
      (t/is (not (nil? res))))))

(t/deftest ^:unit exception-handling
  (t/testing "exception middleware"
    (let [app (imi-core/create-app
               [["/exception" {:post (fn [_] (imi-auth/throw-unauthorized))}]])
          res (-> (mock/request :post "/exception")
                  app)]
      (t/is (= (:status res) (:unauthorized imi-routes/status-codes))))))

(t/deftest ^:unit with-authnz
  (t/testing "with-authnz middleware"
    (with-redefs [imi-auth/with-authnz (fn [handler]
                                         (fn [req]
                                           (-> (handler req)
                                               (assoc :hello "world"))))]
      (let [app (imi-core/create-app
                 [["/authnz" {:post (fn [_] (imi-auth/throw-unauthorized))}]])
            res (-> (mock/request :post "/authnz")
                    app)]
        (t/is (= (:hello res) "world"))))))

(t/deftest ^:unit content-type-negotiation
  (t/testing "content-type negotiation"
    (let [app (imi-core/create-app
               [["/content-type" {:post (constantly {:body {:some-return "TEST!!"}})}]])
          res  (-> (mock/request :post "/content-type")
                   app)]
      (t/is (= (get-in res [:headers "Content-Type"]) "application/json; charset=utf-8")))))

(t/deftest ^:unit openapi-definitions
  (t/testing "openapi"
    (let [app (imi-core/create-app
               [["/para-meters/:test-path-param" {:post {:description "parameters"
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
          params (get-in res [:paths (keyword "/para-meters/{testPathParam}") :post :parameters])
          req-body (get-in res [:paths
                                (keyword "/para-meters/{testPathParam}")
                                :post :requestBody
                                :content
                                (keyword "application/json")
                                :schema
                                :properties])]
      (t/is (some #(and (= (:in %) "path") (= (:name %) "testPathParam")) params))
      (t/is (some #(and (= (:in %) "query") (= (:name %) "testSearchParam")) params))
      (t/is (not (nil? (:helloWorld req-body)))))))
