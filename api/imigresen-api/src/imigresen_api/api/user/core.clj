(ns imigresen-api.api.user.core
  (:require [imigresen-common.components.user.interface :as user]
            [imigresen-api.api.user.req :as req]
            [imigresen-api.api.user.res :as res]
            [imigresen-common.app.auth :refer [protect]]
            [buddy.auth :refer [authenticated? throw-unauthorized]]))

(defn GET [req]
  (-> (req/->GET req)
      (user/find-by-kc-id)
      (res/GET)))

(defn POST! [req]
  (-> (req/->POST req)
      (user/register!)
      (res/POST)))

(defn PATCH! [req]
  ;; exception middleware: https://github.com/metosin/reitit/blob/master/doc/ring/exceptions.md
  ;; wrap-authentication doesn't throw it just sets an identity key on the req, see:
  ;; - https://github.com/duct-framework/module.ataraxy/issues/6#issuecomment-389847751
  (if-not (authenticated? req)
    (throw-unauthorized)
    (-> (req/->PATCH req)
        (user/update!)
        (res/PATCH))))

(defn DELETE! [req]
  (-> (req/->DELETE req)
      (user/delete!)
      (res/DELETE)))

(defn user-routes []
  ["/user"
   ["" {:post {:handler POST!
               :swagger {:summary "Register a user"}}
        :patch {:handler PATCH!
                :middleware [protect]
                :swagger {:summary "Update a user"}}}]
   ["/:id" {:get {:handler GET
                  :middleware [protect]
                  :swagger {:summary "Find user by Keycloak ID"}}
            :delete {:handler DELETE!
                     :middleware [protect]
                     :swagger {:summary "Delete a user"}}}]])
