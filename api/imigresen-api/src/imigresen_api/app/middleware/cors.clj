(ns imigresen-api.app.middleware.cors
  (:require [jumblerg.middleware.cors :refer [wrap-cors]]))

(def cors-middleware
  {:name ::cors
   :description "CORS"
   :wrap #(wrap-cors % #".*imigresen.xyz$" #".*localhost.*")})
