(ns imigresen-api.state.flipt.core
  (:require [mount.core :refer [defstate]]
            [imigresen-api.app.env :refer [env]]
            [taoensso.telemere :as t]
            [clojure.walk :refer [keywordize-keys]])
  (:import (io.flipt.api FliptClient)
           (io.flipt.api.evaluation.models EvaluationRequest
                                           BatchEvaluationRequest
                                           BooleanEvaluationResponse
                                           BatchEvaluationResponse
                                           VariantEvaluationResponse
                                           EvaluationResponseType)
           (io.flipt.api.authentication ClientTokenAuthenticationStrategy)
           (java.util Map)))

(def ^:private flipt-agent (agent {}))

(defn- start []
  (t/log! :debug "flipt state start")
  (let [builder (FliptClient/builder)
        client (-> builder
                   (.authentication (ClientTokenAuthenticationStrategy. (env :rollout-client-token string?)))
                   (.url (env :rollout-url string?))
                   (.build))]
    (send flipt-agent assoc :client client)
    (await flipt-agent)
    ;; return agent
    flipt-agent))

(defn- stop []
  (t/log! :debug "flipt state stop")
  (send flipt-agent dissoc :client)
  (await flipt-agent)
  ;; return agent
  flipt-agent)

(defstate flipt
  :start (start)
  :stop (stop))

(defn boolean-evaluation? [res]
  (= (.getType res) EvaluationResponseType/BOOLEAN_EVALUATION_RESPONSE_TYPE))

(defn variant-evaluation? [res]
  (= (.getType res) EvaluationResponseType/VARIANT_EVALUATION_RESPONSE_TYPE))

(defn error-evaluation? [res]
  (= (.getType res) EvaluationResponseType/ERROR_EVALUATION_RESPONSE_TYPE))

(defn enabled? [res]
  (cond
    (instance? res BooleanEvaluationResponse) (.isEnabled res)
    (instance? res VariantEvaluationResponse) (.isMatch res)
    (instance? res BatchEvaluationResponse) (-> (seq (.getResponses res))
                                                ((partial map #((cond
                                                                  (boolean-evaluation? %) [(.getFlagKey %) (enabled? (.getBooleanResponse %))]
                                                                  (variant-evaluation? %) [(.getVariantKey %) (enabled? (.getVariantKey %))]))))
                                                ((partial into {}))
                                                (keywordize-keys))))

(defn- normalize [res]
  (let [base {:type (cond
                      (boolean-evaluation? res) :boolean
                      (variant-evaluation? res) :variant
                      (error-evaluation? res) :error
                      :else :unknown)
              :flag-key (.getFlagKey res)
              :reason (.getReason res)}]
    (cond
      (boolean-evaluation? res) (conj base {:enabled (enabled? res)
                                            :timestamp (.getTimestamp res)
                                            :duration (.getRequestDurationMillis res)})
      (variant-evaluation? res) (conj base {:enabled (enabled? res)
                                            :segment-keys (seq (.getSegmentKeys res))
                                            :variant-attachment (.getVariantAttachment res)
                                            :variant-key (.getVariantKey res)
                                            :timestamp (.getTimestamp res)
                                            :duration (.getRequestDurationMillis res)}))))

(defn evaluation-request
  ([namespace flag entity context] (evaluation-request namespace flag entity context nil))
  ([namespace flag entity context _reference] (-> (EvaluationRequest/builder)
                                                  (.namespaceKey (name namespace))
                                                  (.flagKey (name flag))
                                                  (.entityId entity)
                                                  ;; TODO: need to convert clojure hash map to java map
                                                  (.context (Map. context))
                                                  ;; TODO: optional, can set to nil? or do we not invoke reference
                                                  ;; (.reference reference)
                                                  (.build))))

(defn evaluate-variant [client req]
  (-> client
      (.evaluation)
      (.evaluateVariant req)
      (normalize)))

(defn evaluate-boolean [client req]
  (-> client
      (.evaluation)
      (.evaluateBoolean req)
      (normalize)))

(defn evaluate-batch [client batch-reqs]
  (let [batch (-> (BatchEvaluationRequest/builder)
                  (.requests batch-reqs)
                  (.build))]
    (-> client
        (.evaluation)
        (.evaluateBatch batch)
        (.getResponses batch)
        (seq)
        ((partial map #((cond
                          (boolean-evaluation? %) [(.getFlagKey %) (normalize (.getBooleanResponse %))]
                          (variant-evaluation? %) [(.getVariantKey %) (normalize (.getVariantResponse %))]))))
        ((partial into {}))
        (keywordize-keys))))
