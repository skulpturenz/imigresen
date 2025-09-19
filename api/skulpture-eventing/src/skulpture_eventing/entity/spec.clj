(ns skulpture-eventing.entity.spec
  (:require [clj-uuid :as uuid]
            [clojure.spec.alpha :as s]
            [java-time.api :as jt]
            [spec-tools.data-spec :as ds]))

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
