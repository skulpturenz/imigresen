(ns imigresen-api.app.kc
  (:require [keycloak.deployment :refer [deployment client-conf]]
            [imigresen-api.app.env :refer [env]]))

(defn create-kc-client-conf []
  (client-conf {:auth-server-url (env :kc-auth-server-url string?)
                :realm            (env :kc-realm string?)
                :client-id        (env :kc-oauth-client-id string?)
                :client-secret    (env :kc-oauth-client-secret string?)}))

(defn create-kc-deployment []
  (deployment (create-kc-client-conf)))
