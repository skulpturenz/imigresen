(ns imigresen-api.state.flipt.core
  (:require [mount.core :refer [defstate]]
            [imigresen-api.app.env :refer [env]]
            [taoensso.telemere :as t]
            [clojure.walk :refer [keywordize-keys]]
            [org.httpkit.client :as http]
            [cheshire.core :as json]
            [imigresen-api.app.routes :refer [status-codes]]))

(def ^:private flipt-agent (agent {}))

(defn start [url]
  (t/log! :debug "flipt state start")
  (let [options {:url url
                 :as :auto}
        ;; TODO: remove duplicate slashes
        client #(http/request (conj options % {:url (str (:url options) "/" (:path %))}) identity)]
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
  :start (start (env :rollout-url string?))
  :stop (stop))

(defn enabled?
  ([client flag namespace context]
   (enabled? client flag namespace "" context))
  ([client flag namespace entity context]
   (enabled? client flag namespace entity context nil))
  ([client flag namespace entity context reference?]
   (let [{:keys [status body]} @(client {:method :post
                                         :path "/evaluate/v1/boolean"
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
   (variant client flag namespace "" context))
  ([client flag namespace entity context]
   (variant client flag namespace entity context nil))
  ([client flag namespace entity context reference?]
   (let [request-id (random-uuid)
         {:keys [status body]} @(client {:method :post
                                         :path "/evaluate/v1/variant"
                                         :body (json/encode {"context" context
                                                             "entityId" (str entity)
                                                             "flagKey" (name flag)
                                                             "namespace-key" (name namespace)
                                                             "reference" (str reference?)
                                                             "requestId" request-id})})
         keywordized (keywordize-keys body)]
     (if (and (= status (:ok status-codes)) (= (:requestId keywordized) (str request-id)))
       {:match (:match keywordized)
        :request-id (:requestId keywordized)
        :key (:variantKey keywordized)
        :attachment (:variantAttachment keywordized)}
       nil))))

(defn flags
  ([client namespace]
   (flags client namespace nil nil nil nil))
  ([client namespace limit?]
   (flags client namespace limit? nil nil nil))
  ([client namespace limit? offset?]
   (flags client namespace limit? offset? nil nil))
  ([client namespace limit? offset? page-token?]
   (flags client namespace limit? offset? page-token? nil))
  ([client namespace limit? offset? page-token? reference?]
   (let [{:keys [status body]} @(client {:method :get
                                         :path (str "/api/v1/namespace" "/" namespace "/flags")
                                         :query-params {:limit limit?
                                                        :offset offset?
                                                        :pageToken page-token?
                                                        :reference reference?}})]
     (if (= status (:ok status-codes))
       (keywordize-keys body)
       nil))))
