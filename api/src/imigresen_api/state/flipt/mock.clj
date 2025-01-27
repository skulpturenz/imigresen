(ns imigresen-api.state.flipt.mock
  (:require [mount.core :refer [defstate]]
            [taoensso.telemere :as t]
            [imigresen-api.state.flipt.core :refer [boolean-evaluation? variant-evaluation?]]
            [imigresen-api.app.utils :refer [truthy]])
  (:import (io.flipt.api.evaluation.models EvaluationResponse
                                           BatchEvaluationResponse
                                           BooleanEvaluationResponse
                                           VariantEvaluationResponse
                                           EvaluationResponseType
                                           EvaluationReason)))

(def ^:private flipt-agent (agent {}))

(definterface EvaluationMock
  (^io.flipt.api.evaluation.models.VariantEvaluationResponse evaluateVariant [^io.flipt.api.evaluation.models.EvaluationRequest req])
  (^io.flipt.api.evaluation.models.BooleanEvaluationResponse evaluateBoolean [^io.flipt.api.evaluation.models.EvaluationRequest req])
  (^io.flipt.api.evaluation.models.EvaluationResponse evaluateBatch [^io.flipt.api.evaluation.models.BatchEvaluationRequest req]))

(definterface FliptClientMock
  ;; TODO: class not found error when using `EvaluationMock`
  (^Object evaluation []))

;; {:namespace {:flag-key :resolver}}
(defn create-mock-flipt-client [config]
  (let [evaluate #((let [namespace ((keyword (.getNamespaceKey %)) config)
                         resolver ((keyword (.getFlagKey %)) namespace)]
                     (resolver %)))
        ;; note: cant use `Evaluation` directly because private ctor
        evaluation (reify EvaluationMock
                     (evaluateVariant [_this req] (evaluate req))
                     (evaluateBoolean [_this req] (evaluate req))
                     (evaluateBatch [_this req] (evaluate req)))]
    ;; note: can't use `FliptClient` directly because private ctor
    (reify FliptClientMock
      (evaluation [_this] evaluation))))

(defn evaluation-reason
  ([] (evaluation-reason nil))
  ([reason?] (truthy reason? EvaluationReason/DEFAULT_EVALUATION_REASON)))

(defn evaluation-response
  ([enabled flag-key reason request-duration-millis timestamp]
   (BooleanEvaluationResponse. enabled flag-key reason request-duration-millis timestamp))
  ([match segment-keys reason flag-key variant-key variant-attachment request-duration-millis timestamp]
   (VariantEvaluationResponse. match segment-keys reason flag-key variant-key variant-attachment request-duration-millis timestamp))
  ([responses]
   (BatchEvaluationResponse. (map
                              #((cond
                                  (boolean-evaluation? %) (EvaluationResponse. EvaluationResponseType/BOOLEAN_EVALUATION_RESPONSE_TYPE % nil nil)
                                  (variant-evaluation? %) (EvaluationResponse. EvaluationResponseType/VARIANT_EVALUATION_RESPONSE_TYPE % nil nil)))
                              responses))))

(defn- start [client]
  (t/log! :debug "flipt mock state start")
  (send flipt-agent assoc :client client)
  (await flipt-agent)
  ;; return agent
  flipt-agent)

(defn- stop []
  (t/log! :debug "flipt mock state stop")
  (send flipt-agent dissoc :client)
  (await flipt-agent)
  ;; return agent
  flipt-agent)

(defstate flipt
  :start start
  :stop (stop))
