(ns imigresen-api.eventing.test.handlers
  (:require [imigresen-common.eventing.handlers :as imi-eventing-handlers]))

;; notes: kind of CQRS?
;; commands: events from `imigresen-api` are related to events in `imigresen-common`
;; queries: queries go to components and they build up the current state of the entity
;; no queues: dispatch, validate, persist
(defmethod imi-eventing-handlers/dispatch ::test-event [_event] :test-event)
