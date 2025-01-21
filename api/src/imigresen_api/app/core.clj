(ns imigresen-api.app.core
  (:require
   [clojure.string]
   [reitit.ring :only [ring-handler router routes create-default-handler]]
   [reitit.swagger]
   [reitit.swagger-ui :only [create-swagger-ui-handler]]
   [reitit.dev.pretty]
   [reitit.coercion.spec]
   [reitit.ring.middleware.parameters]
   [reitit.ring.middleware.muuntaja]
   [reitit.ring.coercion]
   [reitit.ring.middleware.exception]
   [muuntaja.core]
   [reitit.ring.middleware.multipart]
   [mount.core]
   [buddy.auth.backends :only [token]]
   [buddy.auth.middleware :only [wrap-authentication wrap-authorization]]
   [buddy.auth.accessrules :only [wrap-access-rules]]
   [keycloak.deployment :only [deployment client-conf]]
   [keycloak.backend :only [buddy-verify-token-fn]]
   [environ.core]
   [imigresen-api.app.env :only [env]]
   [clojure.core.match :only [match]]
   [imigresen-api.api.core :only [handlers]]))

(mount.core/start)

;; upgrade: bump docs reference
;; reitit-ring docs: https://cljdoc.org/d/metosin/reitit-ring/0.7.2/doc/introduction
;; TODO: remove default values
(defn create-keycloak-deployment []
  (deployment
   (client-conf {:auth-server-url (env :kc-auth-server-url string? "http://localhost:8090/auth")
                 :admin-realm      (env :kc-admin-realm string? "master")
                 :realm            (env :kc-realm string? "my-realm")
                 :admin-username   (env :kc-admin-username string? "admin")
                 :admin-password   (env :kc-admin-password string? "adminpass")
                 :client-admin-cli (env :kc-client-admin-cli string? "admin-cli")
                 :client-id        (env :kc-oauth-client-id string? "my-backend")
                 :client-secret    (env :kc-oauth-client-secret string? "1d741292-74a0-42c8-99b7-6a6a744ebb25")})))

(defmacro defroute
  "Creates a route definition, if Swagger options are not specified then the route is hidden in Swagger
   
   Specify `:protected` to require authenticated for a route and `:policies` to configure access rules for the route
   
   Docs: https://cljdoc.org/d/metosin/reitit-ring/0.7.2/doc/basics/route-data"
  {:clj-kondo/lint-as 'clojure.core/def}
  ([name route method handler options?]
   `(def
      ~(symbol name)
      [~route ~(let [keycloak-deployment (create-keycloak-deployment)]
                 {(keyword (clojure.string/lower-case method))
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
  ([name route docstring? method handler options?]
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

(def app
  (ring-handler
   (router

    handlers

    {:exception reitit.dev.pretty/exception
     :data {:coercion reitit.coercion.spec/coercion
            :muuntaja muuntaja.core/instance
            :middleware [reitit.swagger/swagger-feature ;; swagger feature 
                         reitit.ring.middleware.parameters/parameters-middleware ;; query-params & form-params
                         reitit.ring.middleware.muuntaja/format-negotiate-middleware ;; content-negotiation
                         reitit.ring.middleware.muuntaja/format-response-middleware ;; encoding response body
                         reitit.ring.middleware.exception/exception-middleware ;; exception handling
                         reitit.ring.middleware.muuntaja/format-request-middleware ;; decoding request body
                         reitit.ring.coercion/coerce-response-middleware ;; coercing response bodys
                         reitit.ring.coercion/coerce-request-middleware ;; coercing request parameters
                         ;; multipart
                         reitit.ring.middleware.multipart/multipart-middleware]}})

   (routes
    ;; oauth
    (create-swagger-ui-handler
     {:path "/docs"
      :config {:validatorUrl nil
               :urls [{:name "swagger" :url "swagger.json"}]
               :urls.primaryName "swagger"
               :operationsSorter "alpha"}})

    (create-default-handler [:not-found :method-not-allowed :not-acceptable]))))
