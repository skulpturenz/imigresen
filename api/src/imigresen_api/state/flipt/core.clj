(ns imigresen-api.state.flipt.core
  (:require [mount.core]
            [imigresen-api.app.env :refer [env]]
            [taoensso.telemere :as t])
  (:import (io.flipt.api FliptClient)
           (io.flipt.api.evaluation.models EvaluationRequest BatchEvaluationRequest)
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
      (.evaluateVariant req)))

(defn evaluate-boolean [client req]
  (-> client
      (.evaluation)
      (.evaluateBoolean req)))

(defn evaluate-batch [client batch-reqs]
  (let [batch (-> BatchEvaluationRequest/builder
                  (.requests batch-reqs)
                  (.build))]
    (-> client
        (.evaluation)
        (.evaluateBatch batch))))
