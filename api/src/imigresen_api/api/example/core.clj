(ns imigresen-api.api.example.core
  (:require [imigresen-api.app.routes :refer [defroutes defroute status-codes]]
            [imigresen-api.components.hello-world.interface :as hello-world]
            [imigresen-api.components.hello-world.interface-spec :as hello-world-spec]))

(defroute hello-world "/hello-world" :get
  (fn [_req] {:status (:ok status-codes)
              :body (hello-world/get-example)})
  {:summary "hello world route"
   :responses {(:ok status-codes) {:body hello-world-spec/example}}})

(defroutes example-routes "/example"
  hello-world)
