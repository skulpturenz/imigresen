(ns imigresen-api.state.flipt.mock
  (:require [mount.core :refer [defstate]]
            [taoensso.telemere :as t]
            [imigresen-api.state.flipt.core :refer [boolean-evaluation? variant-evaluation?]])
  (:import (io.flipt.api FliptClient
                         Evaluation)
           (io.flipt.api.evaluation.models EvaluationResponse
                                           BatchEvaluationResponse
                                           BooleanEvaluationResponse
                                           VariantEvaluationResponse
                                           EvaluationResponseType
                                           EvaluationReason)))

(def ^:private flipt-agent (agent {}))

;; {:namespace {:flag-key :resolver}}
(defn create-mock-flipt-client [config]
  (let [evaluate #((let [namespace ((keyword (.getNamespaceKey %)) config)
                         resolver ((keyword (.getFlagKey %)) namespace)]
                     (resolver %)))
        evaluation (proxy [Evaluation] []
                     (evaluateVariant evaluate)
                     (evaluateBoolean evaluate)
                     (evaluateBatch evaluate))]
    (proxy [FliptClient] []
      (evaluation [] evaluation))))

(defn evaluation-reason [reason] (EvaluationReason. reason))

(defn evaluation-response
  ([enabled flag-key reason request-duration-millis timestamp]
   (BooleanEvaluationResponse. enabled flag-key reason request-duration-millis timestamp))
  ([match segment-keys reason flag-key variant-key variant-attachment request-duration-millis timestamp]
   (VariantEvaluationResponse. match segment-keys reason flag-key variant-key variant-attachment request-duration-millis timestamp))
  ([responses]
   (BatchEvaluationResponse. (map
                              #((cond
                                  (boolean-evaluation? %) (EvaluationResponse. EvaluationResponseType/BOOLEAN_EVALUATION_RESPONSE_TYPE %)
                                  (variant-evaluation? %) (EvaluationResponseType. EvaluationResponseType/VARIANT_EVALUATION_RESPONSE_TYPE %)))
                              responses))))

(defn- start [client]
  (t/log! :debug "flipt mock state start")
  (send flipt-agent assoc :flipt-client client)
  (await flipt-agent)
  flipt-agent)

(defn- stop []
  (t/log! :debug "flipt mock state stop")
  (send flipt-agent dissoc :flipt-client)
  (await flipt-agent)
  ;; return agent
  flipt-agent)

(defstate flipt-state
  :start start
  :stop (stop))
