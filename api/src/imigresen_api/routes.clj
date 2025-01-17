(ns imigresen-api.routes
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
   [mount.core]))


(clojure.spec.alpha/def ::string string?)

(clojure.spec.alpha/def ::file reitit.ring.middleware.multipart/temp-file-part)
(clojure.spec.alpha/def ::file-params (clojure.spec.alpha/keys :req-un [::file]))
(clojure.spec.alpha/def ::name string?)
(clojure.spec.alpha/def ::size int?)
(clojure.spec.alpha/def ::file-response (clojure.spec.alpha/keys :req-un [::name ::size]))

(defmacro defroute
  ""
  ([route method handler] [route {(keyword (clojure.string/lower-case method)) {:no-doc true :handler handler}}])
  ([route method handler swagger] [route {(keyword (clojure.string/lower-case method)) (assoc swagger :handler handler)}]))

(defmacro defcontext
  ""
  [context options & children] (apply vector context options children))

(def app
  (reitit.ring/ring-handler
   (reitit.ring/router
    [["/docs/swagger.json"
      {:get {:no-doc true
             :swagger {:info {:title "imigresen-api"}}
             :handler (reitit.swagger/create-swagger-handler)}}]

     (defcontext
       ""
       {:tags ["test"]}

       (defroute
         "/hello-world"
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
    (reitit.ring/create-default-handler))))

(mount.core/start)
