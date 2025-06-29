(ns imigresen-api.eventing.test.events
  (:require [imigresen-common.eventing.handlers :as imi-eventing-handlers]))

(defn test-event [] {::imi-eventing-handlers/Event :test-event})
