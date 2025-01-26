(ns imigresen-api.state.flipt.core
  (:require [mount.core]
            [imigresen-api.app.env :refer [env]]
            [taoensso.telemere :as t])
  (:import (io.flipt.api FliptClient)
           (io.flipt.api.evaluation.models EvaluationRequest
                                           BatchEvaluationRequest
                                           BooleanEvaluationResponse
                                           BatchEvaluationResponse
                                           VariantEvaluationResponse
                                           EvaluationResponseType)
           (io.flipt.api.authentication ClientTokenAuthenticationStrategy)))

(def flipt-agent (agent {}))

(defn start []
  (t/log! :debug "flipt state start")
  (let [builder (FliptClient/builder)
        client (-> builder
                   (.authentication (ClientTokenAuthenticationStrategy. (env :rollout-client-token string?)))
                   (.url (env :rollout-url string?))
                   (.build))]
    (send flipt-agent assoc :flipt-client client)
    (await flipt-agent)
    ;; return agent
    flipt-agent))

(defn stop []
  (t/log! :debug "flipt state stop")
  (send flipt-agent dissoc :flipt-client)
  (await flipt-agent)
  ;; return agent
  flipt-agent)

(mount.core/defstate flipt-state
  :start (start))

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
    (instance? res BatchEvaluationResponse) (map #((cond
                                                     (boolean-evaluation? %) (enabled? (.getBooleanResponse %))
                                                     (variant-evaluation? %) (enabled? (.getVariantResponse %)))) (seq (.getResponses res)))))

(defn- normalize [res]
  (let [base {:type (cond
                      (boolean-evaluation? res) :boolean
                      (variant-evaluation? res) :variant
                      (error-evaluation? res) :error
                      :else :unknown)
              :enabled (enabled? res)
              :flag-key (.getFlagKey res)
              :reason (.getReason res)
              :timestamp (.getTimestamp res)
              :duration (.getRequestDurationMillis res)}]
    (if (boolean-evaluation? base)
      base
      (merge base {:segment-keys (seq (.getSegmentKeys res))
                   :variant-attachment (.getVariantAttachment res)
                   :variant-key (.getVariantKey res)}))))

(defn evaluation-request
  ([namespace flag entity context] (evaluation-request namespace flag entity context nil))
  ([namespace flag entity context reference] (-> EvaluationRequest/builder
                                                 (.namespaceKey namespace)
                                                 (.flagKey flag)
                                                 (.entityId entity)
                                                 (.context context)
                                                 ;; TODO: optional, can set to nil? or do we not invoke reference
                                                 (.reference reference)
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
  (let [batch (-> BatchEvaluationRequest/builder
                  (.requests batch-reqs)
                  (.build))]
    (-> client
        (.evaluation)
        (.evaluateBatch batch)
        (.getResponses batch)
        (seq)
        ((partial map #((cond
                          (boolean-evaluation? %) (.getBooleanResponse %)
                          (variant-evaluation? %) (.getVariantResponse %)))))
        ((partial filter #((not (nil? %))))))))
