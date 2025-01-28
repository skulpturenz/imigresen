(ns imigresen-api.state.flipt.core
  (:require [mount.core :refer [defstate]]
            [imigresen-api.app.env :refer [env]]
            [taoensso.telemere :as t]
            [clojure.walk :refer [keywordize-keys]]
            [org.httpkit.client :as http]
            [clojure.data.json :as json]
            [imigresen-api.app.routes :refer [status-codes]]))

(def ^:private flipt-agent (agent {}))

(defn start []
  (t/log! :debug "flipt state start")
  (let [options {:url (env :rollout-url string?)
                 :headers {"Authorization" (str "Bearer" " " (env :rollout-client-token string?))}
                 :as :auto}
        client #(http/request (conj options %))]
    (send flipt-agent assoc :client client)
    (await flipt-agent)
    ;; return agent
    flipt-agent))

(defn stop []
  (t/log! :debug "flipt state stop")
  (send flipt-agent dissoc :client)
  (await flipt-agent)
  ;; return agent
  flipt-agent)

(defstate flipt
  :start (start)
  :stop (stop))

(def ^:private counter (atom 0))

(defn enabled?
  ([client flag namespace context]
   (enabled? client flag namespace (str "anon" "-" (swap! counter inc)) context))
  ([client flag namespace entity context]
   (enabled? client flag namespace entity context nil))
  ([client flag namespace entity context reference?]
   (let [{:keys [status body]} @(client {:method :post
                                         :body (json/encode {"context" context
                                                             "entityId" (str entity)
                                                             "flagKey" (name flag)
                                                             "namespaceKey" (name namespace)
                                                             "reference" (str reference?)})})]
     (if (= status (:ok status-codes))
       (:enabled (keywordize-keys body))
       nil))))

(defn variant
  ([client flag namespace context]
   (variant client flag namespace (str "anon" "-" (swap! counter inc)) context))
  ([client flag namespace entity context]
   (variant client flag namespace entity context nil))
  ([client flag namespace entity context reference?]
   (let [request-id (random-uuid)
         {:keys [status body]} @(client {:method :post
                                         :body (json/encode {"context" context
                                                             "entityId" (str entity)
                                                             "flagKey" (name flag)
                                                             "namespace-key" (name namespace)
                                                             "reference" (str reference?)
                                                             "requestId" request-id})})
         keywordized (keywordize-keys body)]
     (if (and (= status (:ok status-codes)) (= (:request-id keywordized) request-id))
       {:match (:match keywordized)
        :request-id (:request-id keywordized)
        :key (:variant-key keywordized)
        :attachment (:variant-attachment keywordized)}
       nil))))
