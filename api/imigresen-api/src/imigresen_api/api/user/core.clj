(ns imigresen-api.api.user.core
  (:require [imigresen-common.components.user.interface :as user]
            [imigresen-api.api.user.req :as req]
            [imigresen-api.api.user.res :as res]
            [imigresen-common.app.routes :refer [with-authnz]]))

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
               :swagger {:summary "Register a user"}}
        :patch {:handler (with-authnz PATCH!)
                :swagger {:summary "Update a user"}}}]
   ["/:id" {:get {:handler (with-authnz GET)
                  :swagger {:summary "Find user by Keycloak ID"}}
            :delete {:handler (with-authnz DELETE!)
                     :swagger {:summary "Delete a user"}}}]])
