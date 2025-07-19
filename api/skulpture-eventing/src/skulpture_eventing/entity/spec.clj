(ns skulpture-eventing.entity.spec
  (:require [clojure.spec.alpha :as s]
            [spec-tools.data-spec :as ds]
            [java-time.api :as jt]
            [clj-uuid :as uuid]))

(def aggregate (ds/spec {:name ::aggregate
                         :spec {:aggregate {:revision number?}
                                :events vector?
                                :uncommitted-events vector?}}))

(def event (ds/spec {:name ::event
                     :spec {:event-agent string?
                            :entity-id (s/or :string string?
                                             :uuid uuid/uuid?)
                            (ds/opt :time-occurred) jt/instant?
                            :time-observed jt/instant?
                            :event-data #(not (nil? %))
                            :revision number?}}))

(def aggregate? #(s/valid? aggregate %))

(def event? #(s/valid? event %))
