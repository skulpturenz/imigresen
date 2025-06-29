(ns imigresen-api.app.eventing
  (:require [imigresen-common.eventing.store :as imi-eventing-store]
            [spec-tools.data-spec :as ds]))

(defn init []
  (swap! imi-eventing-store/schema-registry conj {::event (ds/spec {:name ::event
                                                                    :spec {:uuid uuid?
                                                                           :revision pos-int?
                                                                           :event-agent string?
                                                                           :entity-id string?
                                                                           :occurred-at inst?
                                                                           :time-occurred inst?
                                                                           :time-observed inst?}})
                                                  ::test (ds/spec {:name ::test
                                                                   :spec {:event {:hello string?}}})}))
