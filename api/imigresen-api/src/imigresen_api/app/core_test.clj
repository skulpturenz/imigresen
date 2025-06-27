(ns imigresen-api.app.core-test
  (:require [clojure.test :as t]
            [imigresen-api.app.core :as imi-core]
            [imigresen-common.app.routes :as imi-routes]
            [muuntaja.core :as m]))

(t/deftest ^:unit response->camelCase
  (t/testing "camelCase response keys"))

(t/deftest ^:unit request->kebab-case-keyword
  (t/testing "kebab-case-keyword request keys"))

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
          spec (->> {:request-method :get :uri "/openapi.json"}
                    app
                    :body
                    (m/decode "application/json"))
          parameters (get-in spec [:paths (keyword "/parameters") :post :parameters])
          request-body (get-in spec [:paths
                                     (keyword "/parameters")
                                     :post :requestBody
                                     :content
                                     (keyword "application/json")
                                     :schema
                                     :properties])]
      (t/is (some #(and (= (:in %) "path") (= (:name %) "testPathParam")) parameters))
      (t/is (some #(and (= (:in %) "query") (= (:name %) "testSearchParam")) parameters))
      (t/is (not (nil? (:helloWorld request-body)))))))

(t/deftest ^:unit search-params
  (t/testing "search params"))

(t/deftest ^:unit route-params
  (t/testing "route params"))

(t/deftest ^:unit form-params
  (t/testing "form params"))
