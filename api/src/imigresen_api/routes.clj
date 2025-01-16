(ns imigresen-api.routes
  (:require
   [compojure.core]
   [compojure.route]))

(compojure.core/defroutes app
  (compojure.core/GET "/" [& _args] "Hello world!!")
  (compojure.route/not-found "Not found!!"))
