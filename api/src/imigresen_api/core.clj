(ns imigresen-api.core
  (:require [compojure.core]
            [compojure.route]
            [ring.adapter.jetty])
  (:gen-class))

(compojure.core/defroutes app
  (compojure.core/GET "/" [& _args] "Hello world!!")
  (compojure.route/not-found "Not found!!"))

(defn -main
  "I don't do a whole lot ... yet."
  [& _args]
  (println "Hello, World!")
  (ring.adapter.jetty/run-jetty app {:port 3000}))
