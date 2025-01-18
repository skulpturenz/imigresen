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

;; reitit-ring docs: https://cljdoc.org/d/metosin/reitit-ring/0.7.2/doc/introduction

(def keycloak-deployment (keycloak.deployment/deployment
                          (keycloak.deployment/client-conf {:auth-server-url (imigresen-api.core.env/env :kc-auth-server-url string?)
                                                            :admin-realm      (imigresen-api.core.env/env :kc-admin-realm string?)
                                                            :realm            (imigresen-api.core.env/env :kc-realm string?)
                                                            :admin-username   (imigresen-api.core.env/env :kc-admin-username string?)
                                                            :admin-password   (imigresen-api.core.env/env :kc-admin-password string?)
                                                            :client-admin-cli (imigresen-api.core.env/env :kc-client-admin-cli string?)
                                                            :client-id        (imigresen-api.core.env/env :kc-oauth-client-id string?)
                                                            :client-secret    (imigresen-api.core.env/env :kc-oauth-client-secret string?)})))

(defmacro defroute
  "Creates a route definition, if Swagger options are not specified then the route is hidden in Swagger
   
   Specify `:protected` to require authenticated for a route and `:policies` to configure access rules for the route"
  ([route method handler options?]
   [route {(keyword (clojure.string/lower-case method))
           (assoc (merge {} options?)
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
                  :no-doc (or (nil? options?) (:no-doc options?)))}])
  ([route docstring? method handler options?]
   ^{:doc docstring?}
   `(defroute ~route ~method ~handler ~options?)))

(defmacro defcontext
  "Creates a parent route definition"
  {:arglists '([context docstring? options? & children]
               [context options? & children])}
  ([context & args]
   (if (string? (first args))
     ^{:doc (first args)}
     `(defcontext ~context ~@(rest args)) ;; [context docstring? tags? & children]
     (apply vector (if (= context "/") "" context) args)))) ;; [context tags? & children]

(def app
  (reitit.ring/ring-handler
   (reitit.ring/router
    [(defroute
       "/docs/swagger.json"
       "Test!"
       "get"
       (reitit.swagger/create-swagger-handler)
       {:no-doc true
        :swagger {:info {:title "imigresen-api"}}})

     (defcontext
       "/"
       "Docs docs docs!!!"
       {:tags ["test"]}

       (defroute
         "/hello-world"
         "Hello world docstring!!"
         "GET"
         (fn [& _args] {:status 200
                        :headers {"Content-Type" "text/plain"}
                        :body "Hello world!"})
         {:summary "hello world!!"
          :parameters nil
          :responses {200 {:content {"text/plain" {:schema string?}}
                           :body ::string}}}))

     (defcontext
       "/files"
       {:tags ["files"]}

       (defroute
         "/upload"
         "Upload doc string!!!"
         "post"
         (fn [{{{:keys [file]} :multipart} :parameters}]
           {:status 200
            :body {:name (:filename file)
                   :size (:size file)}})
         {:summary "upload a file"
          :parameters {:multipart ::file-params}
          :responses {200 {:body ::file-response}}}))]

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
