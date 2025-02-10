(ns imigresen-api.api.user.core
  (:require [imigresen-api.components.user.interface :as user]
            [imigresen-api.api.user.req :as req]
            [imigresen-api.api.user.res :as res]))

(defn user-routes []
  ["/user"
   ["" {:post {:handler (fn [req] (-> (req/->POST req)
                                      (user/register!)
                                      (res/POST)))
               :swagger {:summary "Register a user"}}
        :patch {:handler (fn [req] (-> (req/->PATCH req)
                                       (user/update!)
                                       (res/PATCH)))
                :swagger {:summary "Update a user"}}}]
   ["/:id" {:get {:handler (fn [req]
                             (-> (req/->GET req)
                                 (user/find-by-kc-id)
                                 (res/GET)))
                  :swagger {:summary "Find user by Keycloak ID"}}
            :delete {:handler (fn [req]
                                (-> (req/->DELETE req)
                                    (user/delete!)
                                    (res/DELETE)))
                     :swagger {:summary "Delete a user"}}}]])
