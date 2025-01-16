(ns imigresen-api.core
  (:require [compojure.core]
            [compojure.route]
            [ring.adapter.jetty]
            [ring.middleware.reload]
            [environ.core])
  (:gen-class))

(compojure.core/defroutes app
  (compojure.core/GET "/" [& _args] "Hello world!!")
  (compojure.route/not-found "Not found!!"))

(def reloadable-app
  (ring.middleware.reload/wrap-reload #'app))

(defn -main
  "I don't do a whole lot ... yet."
  [& _args]
  (println "Hello, World!")
  (ring.adapter.jetty/run-jetty
   (if (not= (environ.core/env :java-env) "production") reloadable-app app)
   {:port 3000}))
