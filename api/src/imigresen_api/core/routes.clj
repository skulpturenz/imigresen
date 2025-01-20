(ns imigresen-api.core.routes
  (:require
   [clojure.spec.alpha]
   [clojure.string]
   [reitit.ring]
   [reitit.swagger]
   [reitit.swagger-ui]
   [reitit.dev.pretty]
   [reitit.coercion.spec]
   [reitit.ring.middleware.parameters]
   [reitit.ring.middleware.muuntaja]
   [reitit.ring.coercion]
   [reitit.ring.middleware.exception]
   [muuntaja.core]
   [reitit.ring.middleware.multipart]
   [mount.core]
   [buddy.auth.backends]
   [buddy.auth.middleware]
   [buddy.auth.accessrules]
   [keycloak.deployment]
   [keycloak.backend]
   [environ.core]
   [imigresen-api.core.env]
   [clojure.core.match]))

(clojure.spec.alpha/def ::string string?)

(clojure.spec.alpha/def ::file reitit.ring.middleware.multipart/temp-file-part)
(clojure.spec.alpha/def ::file-params (clojure.spec.alpha/keys :req-un [::file]))
(clojure.spec.alpha/def ::name string?)
(clojure.spec.alpha/def ::size int?)
(clojure.spec.alpha/def ::file-response (clojure.spec.alpha/keys :req-un [::name ::size]))

;; upgrade: bump docs reference
;; reitit-ring docs: https://cljdoc.org/d/metosin/reitit-ring/0.7.2/doc/introduction

;; TODO: remove default values
(defn create-keycloak-deployment []
  (keycloak.deployment/deployment
   (keycloak.deployment/client-conf {:auth-server-url (imigresen-api.core.env/env :kc-auth-server-url string? "http://localhost:8090/auth")
                                     :admin-realm      (imigresen-api.core.env/env :kc-admin-realm string? "master")
                                     :realm            (imigresen-api.core.env/env :kc-realm string? "my-realm")
                                     :admin-username   (imigresen-api.core.env/env :kc-admin-username string? "admin")
                                     :admin-password   (imigresen-api.core.env/env :kc-admin-password string? "adminpass")
                                     :client-admin-cli (imigresen-api.core.env/env :kc-client-admin-cli string? "admin-cli")
                                     :client-id        (imigresen-api.core.env/env :kc-oauth-client-id string? "my-backend")
                                     :client-secret    (imigresen-api.core.env/env :kc-oauth-client-secret string? "1d741292-74a0-42c8-99b7-6a6a744ebb25")})))

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
                                    (clojure.core.match/match [options?]
                                      [{:protected true}] (-> handler
                                                              (buddy.auth.middleware/wrap-authentication
                                                               (buddy.auth.backends/token {:authfn (keycloak.backend/buddy-verify-token-fn keycloak-deployment)})))
                                      [{:protected true :policies _}] (-> handler
                                                                          (buddy.auth.middleware/wrap-authentication
                                                                           (buddy.auth.backends/token {:authfn (keycloak.backend/buddy-verify-token-fn keycloak-deployment)}))
                                                                          (buddy.auth.middleware/wrap-authorization
                                                                           (buddy.auth.backends/token {:authfn (keycloak.backend/buddy-verify-token-fn keycloak-deployment)}))
                                                                          (buddy.auth.accessrules/wrap-access-rules (:policies options?)))
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
     `(def ~(with-meta name {:doc (first args)}) (var-get (defroutes ~name ~context ~@(rest args)))) ;; [name context docstring? tags? & children]
     `(def ~(symbol name) ~(apply vector (if (= context "/") "" context) args))))) ;; [name context tags? & children]

(defroute hello-world-route
  "/hello-world"
  "Hello world docstring!!"
  "GET"
  (fn [& _args] {:status 200
                 :headers {"Content-Type" "text/plain"}
                 :body "Hello world!"})
  {:summary "hello world!!"
   :parameters nil
   :responses {200 {:content {"text/plain" {:schema string?}}
                    :body ::string}}})

(defroutes root-routes
  "/"
  "Docs docs docs!!!"
  {:tags ["test"]}

  hello-world-route)

(defroute
  swagger-config-route
  "/docs/swagger.json"
  "Test!"
  "get"
  (reitit.swagger/create-swagger-handler)
  {:no-doc true
   :swagger {:info {:title "imigresen-api"}}})

(defroute
  upload-route
  "/upload"
  "Upload doc string!!!"
  "post"
  (fn [{{{:keys [file]} :multipart} :parameters}]
    {:status 200
     :body {:name (:filename file)
            :size (:size file)}})
  {:summary "upload a file"
   :parameters {:multipart ::file-params}
   :responses {200 {:body ::file-response}}})

(defroutes files-routes
  "/files"
  {:tags ["files"]}

  upload-route)

(def app
  (reitit.ring/ring-handler
   (reitit.ring/router
    [swagger-config-route root-routes files-routes]

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

   (reitit.ring/routes
    ;; oauth
    (reitit.swagger-ui/create-swagger-ui-handler
     {:path "/docs"
      :config {:validatorUrl nil
               :urls [{:name "swagger" :url "swagger.json"}]
               :urls.primaryName "swagger"
               :operationsSorter "alpha"}})

    (reitit.ring/create-default-handler [:not-found :method-not-allowed :not-acceptable]))))

(mount.core/start)
