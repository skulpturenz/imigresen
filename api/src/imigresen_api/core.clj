(ns imigresen-api.core
  (:require [compojure.core]
            [compojure.route]
            [ring.adapter.jetty]
            [environ.core]
            [imigresen-api.routes])
  (:gen-class))

;; TODO - remvoe
(defn -main
  []
  (println "Hello world")
  (ring.adapter.jetty/run-jetty imigresen-api.routes/app {}))
