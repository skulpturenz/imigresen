(ns imigresen-api.components.hello-world.core
  (:require [imigresen-api.components.hello-world.store :as store]))

(defn example []
  (let [result (store/get-data)]
    result))
