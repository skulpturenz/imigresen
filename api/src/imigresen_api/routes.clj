(ns imigresen-api.routes
  (:require
   [compojure.core]
   [compojure.route]
   [ring.swagger.swagger-ui]))

(compojure.core/defroutes app
  ;; TODO: oauth
  (ring.swagger.swagger-ui/swagger-ui {:path "/docs"})
  (compojure.core/GET "/test" [] "TEST!!")
  (compojure.core/GET "/" [& _args] "Hello world!!")
  (compojure.route/not-found "Not found!!"))
