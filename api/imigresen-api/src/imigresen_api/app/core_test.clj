(ns imigresen-api.app.core-test
  (:require [clojure.test :as t]))

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
  (t/testing "openapi"))

(t/deftest ^:unit search-params
  (t/testing "search params"))

(t/deftest ^:unit route-params
  (t/testing "route params"))

(t/deftest ^:unit form-params
  (t/testing "form params"))
