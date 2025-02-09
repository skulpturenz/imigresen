(ns imigresen-api.api.user.core
  (:require [imigresen-api.app.routes :refer [defroutes defroute]]
            [imigresen-api.components.user.interface :as user]
            [imigresen-api.api.user.req :as req]
            [imigresen-api.api.user.res :as res]))

(defroute GET "/:kc-id" :get
  (fn [req]
    (-> (req/->GET req)
        (user/find-by-kc-id)
        (res/GET)))
  {:summary "Find user by Keycloak ID"})

(defroute POST! "/" :post
  (fn [req]
    (-> (req/->POST req)
        (user/register!)
        (res/POST)))
  {:summary "Register a user"})

(defroute PATCH! "/" :patch
  (fn [req]
    (-> (req/->PATCH req)
        (user/update!)
        (res/PATCH)))
  {:summary "Update a user"})

(defroute DELETE! "/:uuid" :delete
  (fn [req]
    (-> (req/->DELETE req)
        (user/delete!)
        (res/DELETE)))
  {:summary "Delete a user"})

(defroutes user-routes "/user"
  GET
  POST!
  PATCH!
  DELETE!)
