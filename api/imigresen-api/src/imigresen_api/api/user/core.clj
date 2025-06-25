(ns imigresen-api.api.user.core
  (:require [imigresen-common.components.user.interface :as user]
            [imigresen-api.api.user.req :as req]
            [imigresen-api.api.user.res :as res]
            [imigresen-common.app.auth :refer [protect]]
            [java-time.api :as jt]))

(defn GET [req]
  (-> (req/->GET req)
      (user/find-by-kc-id)
      (res/GET)))

(defn POST! [req]
  (-> (req/->POST req)
      (user/register!)
      (res/POST)))

(defn PATCH! [req]
  (-> (req/->PATCH req)
      (user/update!)
      (res/PATCH)))

(defn DELETE! [req]
  (-> (req/->DELETE req)
      (user/delete!)
      (res/DELETE)))

(defn user-routes []
  ["/user"
   ["" {:post {:handler POST!
               :swagger {:summary "Register a user"}
               :parameters {:body {:email string? ;; TODO: kebab-case automatically
                                   :firstName string?
                                   :lastName string?
                                   :password string?}}
               :responses {200 {:body {:uuid string?
                                       :firstName string?
                                       :lastName string?
                                       :email string?
                                       :updatedAt jt/local-date-time?
                                       :createdAt jt/local-date-time?}}}}
        :patch {:handler PATCH!
                :middleware [protect]
                :swagger {:summary "Update a user"}}}]
   ["/:id" {:get {:handler GET
                  :middleware [protect]
                  :swagger {:summary "Find user by Keycloak ID"}}
            :delete {:handler DELETE!
                     :middleware [protect]
                     :swagger {:summary "Delete a user"}}}]])
