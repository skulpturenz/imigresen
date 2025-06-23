(ns imigresen-api.api.user.core
  (:require [imigresen-common.components.user.interface :as user]
            [imigresen-api.api.user.req :as req]
            [imigresen-api.api.user.res :as res]
            [imigresen-common.app.routes :refer [with-authnz]]
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

;; TODO: with-authnz logic moves up to app level
;; update with-authnz so it just does the throwing part as in PATCH
;; TODO: swagger set auth token cookie?
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
