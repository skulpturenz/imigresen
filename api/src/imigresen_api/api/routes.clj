(ns imigresen-api.api.routes
  (:require
   [reitit.swagger]
   [reitit.dev.pretty]
   [reitit.coercion.spec]
   [reitit.ring.middleware.parameters]
   [reitit.ring.middleware.muuntaja]
   [reitit.ring.coercion]
   [reitit.ring.middleware.exception]
   [muuntaja.core]
   [reitit.ring.middleware.multipart]
   [mount.core]
   [buddy.auth.backends :refer [token]]
   [buddy.auth.middleware :refer [wrap-authentication wrap-authorization]]
   [buddy.auth.accessrules :refer [wrap-access-rules]]
   [keycloak.deployment :refer [deployment client-conf]]
   [keycloak.backend :refer [buddy-verify-token-fn]]
   [imigresen-api.app.env :refer [env]]
   [clojure.core.match :refer [match]]))

;; upgrade: bump docs reference
;; reitit-ring docs: https://cljdoc.org/d/metosin/reitit-ring/0.7.2/doc/introduction
;; TODO: remove default values
(defn create-keycloak-deployment []
  (deployment
   (client-conf {:auth-server-url (env :kc-auth-server-url string?)
                 :admin-realm      (env :kc-admin-realm string?)
                 :realm            (env :kc-realm string?)
                 :admin-username   (env :kc-admin-username string?)
                 :admin-password   (env :kc-admin-password string?)
                 :client-admin-cli (env :kc-client-admin-cli string?)
                 :client-id        (env :kc-oauth-client-id string?)
                 :client-secret    (env :kc-oauth-client-secret string?)})))

(defmacro defroute
  "Creates a route definition, if Swagger options are not specified then the route is hidden in Swagger
   
   Specify `:protected` to require authenticated for a route and `:policies` to configure access rules for the route
   
   Docs: https://cljdoc.org/d/metosin/reitit-ring/0.7.2/doc/basics/route-data"
  {:clj-kondo/lint-as 'clojure.core/def}
  ([name route method handler options?]
   `(def
      ~(symbol name)
      [~route ~(let [keycloak-deployment (create-keycloak-deployment)]
                 {method
                  (assoc options?
                         :handler (if (not (nil? options?))
                                    (match [options?]
                                      [{:protected true}] (-> handler (wrap-authentication
                                                                       (token {:authfn (buddy-verify-token-fn keycloak-deployment)})))
                                      [{:protected true :policies _}] (-> handler
                                                                          (wrap-authentication
                                                                           (token {:authfn (buddy-verify-token-fn keycloak-deployment)}))
                                                                          (wrap-authorization
                                                                           (token {:authfn (buddy-verify-token-fn keycloak-deployment)}))
                                                                          (wrap-access-rules (:policies options?)))
                                      :else handler)
                                    handler)
                         :no-doc (or (nil? options?) (:no-doc options?)))})]))
  ([name docstring? route method handler options?]
   `(def ~(with-meta name {:doc docstring?}) (var-get (defroute ~name ~route ~method ~handler ~options?)))))

(defmacro defroutes
  "Creates a route definition with child routes
   
   Docs: Docs: https://cljdoc.org/d/metosin/reitit-ring/0.7.2/doc/basics/route-data"
  {:clj-kondo/lint-as 'clojure.core/def
   :arglists '([context docstring? options? & children]
               [context options? & children])}
  ([name context & args]
   (if (string? (first args))
     ;; [name context docstring? tags? & children]
     `(def ~(with-meta name {:doc (first args)}) (var-get (defroutes ~name ~context ~@(rest args))))
     ;; [name context tags? & children]
     `(def ~(symbol name) ~(apply vector (if (= context "/") "" context) args)))))
