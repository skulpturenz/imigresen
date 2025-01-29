(ns imigresen-api.components.user.interface
  (:require [imigresen-api.components.user.core :as core]))

(def login (partial core/login {:find-by-email (fn [] (println "Test"))}))

(def register! (partial core/register! {:unique-email? (fn [] (println "Test"))}))

(def delete! (partial core/delete! {:find-by-uuid (fn [] (println "Test"))
                                    :delete-user (fn [] (println "Test"))}))
