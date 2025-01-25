(ns imigresen-api.components.hello-world.interface
  (:require [imigresen-api.components.hello-world.core :as core]))

(defn get-example []
  (core/example))
