(ns imigresen-api.app.routes
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
   [clojure.core.match :refer [match]]
   [clojure.spec.alpha :as s]
   [clojure.string :as str]))

;; upgrade: bump docs reference
;; reitit-ring docs: https://cljdoc.org/d/metosin/reitit-ring/0.7.2/doc/introduction
;; TODO: remove default values
(defn create-keycloak-deployment []
  (deployment
   ;; TODO: when reading from env why are there quotes?
   (client-conf {:auth-server-url (env :kc-auth-server-url (s/and string? (s/conformer #(str/replace % "\"" ""))))
                 :realm            (env :kc-realm (s/and string? (s/conformer #(str/replace % "\"" ""))))
                 :client-id        (env :kc-oauth-client-id (s/and string? (s/conformer #(str/replace % "\"" ""))))
                 :client-secret    (env :kc-oauth-client-secret (s/and string? (s/conformer #(str/replace % "\"" ""))))})))

(defmacro defroute
  "Creates a route definition, if Swagger options are not specified then the route is hidden in Swagger
   
   Specify `:protected` to require authenticated for a route and `:policies` to configure access rules for the route
   
   Docs: https://cljdoc.org/d/metosin/reitit-ring/0.7.2/doc/basics/route-data"
  {:clj-kondo/lint-as 'clojure.core/def}
  ([name route method handler]
   `(defroute ~name ~route ~method ~handler nil))
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
   
   Docs: https://cljdoc.org/d/metosin/reitit-ring/0.7.2/doc/basics/route-data"
  {:clj-kondo/lint-as 'clojure.core/def
   :arglists '([context docstring? options? & children]
               [context options? & children])}
  ([name context & args]
   (if (string? (first args))
     ;; [name context docstring? tags? & children]
     `(def ~(with-meta name {:doc (first args)}) (var-get (defroutes ~name ~context ~@(rest args))))
     ;; [name context tags? & children]
     `(def ~(symbol name) ~(apply vector (if (= context "/") "" context) args)))))

;; https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
(def status-codes {:continue 100
                   :switching-protocols 101
                   :processing 102
                   :early-hints 103
                   :ok 200
                   :created 201
                   :accepted 202
                   :non-authoritative-information 203
                   :no-content 204
                   :reset-content 205
                   :partial-content 206
                   :multi-status 207
                   :already-reported 208
                   :im-used 226
                   :multiple-choices 300
                   :move-permanently 301
                   :found 302
                   :see-other 303
                   :not-modified 304
                   :temporary-redirect 307
                   :permanent-redirect 308
                   :bad-request 400
                   :unauthorized 401
                   :payment-required 402
                   :forbidden 403
                   :not-found 404
                   :method-not-allowed 405
                   :not-acceptable 406
                   :proxy-authentication-required 407
                   :request-timeout 408
                   :conflict 409
                   :gone 410
                   :length-required 411
                   :precondition-failed 412
                   :content-too-large 413
                   :uri-too-long 414
                   :unsupported-media-type 415
                   :range-not-satisfiable 416
                   :expectation-failed 417
                   :teapot 418
                   :misdirected-request 421
                   :unprocessable-content 422
                   :locked 423
                   :failed-dependency 424
                   :too-early 425
                   :upgrade-required 426
                   :precondition-required 428
                   :too-many-requests 429
                   :request-header-fields-too-large 431
                   :unavailable-for-legal-reasons 451
                   :internal-server-error 500
                   :not-implemented 501
                   :bad-gateway 502
                   :service-unavailable 503
                   :gateway-timeout 504
                   :http-version-not-supported 505
                   :variant-also-negotiates 506
                   :insufficient-storage 507
                   :loop-detected 508
                   :not-extended 510
                   :network-authentication-required 511})
