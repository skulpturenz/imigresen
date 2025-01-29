(ns imigresen-api.app.kc
  (:require [keycloak.deployment :refer [deployment client-conf]]
            [imigresen-api.app.env :refer [env]]))

;; TODO: remove default values
(defn create-keycloak-deployment []
  (deployment
   ;; TODO: when reading from env why are there quotes?
   (client-conf {:auth-server-url (env :kc-auth-server-url string?)
                 :realm            (env :kc-realm string?)
                 :client-id        (env :kc-oauth-client-id string?)
                 :client-secret    (env :kc-oauth-client-secret string?)})))
