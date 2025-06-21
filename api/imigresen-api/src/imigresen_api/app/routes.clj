(ns imigresen-api.app.routes
  (:require [reitit.swagger]
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
            [keycloak.backend :refer [buddy-verify-token-fn]]
            [imigresen-api.app.kc :refer [create-kc-deployment]]))

(defn with-authnz
  "Returns a middleware which authenticates and/or authorizes the route"
  ([handler]
   (fn [{:keys [policies] :as request}]
     (let [keycloak-deployment (create-kc-deployment)
           handler (if (nil? policies)
                     (-> handler
                         (wrap-authentication (token {:authfn (buddy-verify-token-fn keycloak-deployment)})))
                     (-> handler
                         (wrap-authentication (token {:authfn (buddy-verify-token-fn keycloak-deployment)}))
                         (wrap-authorization (token {:authfn (buddy-verify-token-fn keycloak-deployment)}))
                         (wrap-access-rules (:policies policies))))]
       (handler request)))))

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

(def content-types {:json "application/json"})
