(ns imigresen-api.app.server
  (:require [imigresen-api.app.core :as core]
            [imigresen-common.app.logging :as imi-logging]
            [clj-reload.core :as reload]
            [watchtower.core :as watchtower]
            [ring.adapter.jetty :as adapter]
            [nrepl.server :as nrepl]
            [cider.nrepl :as cider]
            [clojure.spec.alpha :as s]
            [imigresen-common.app.env :as imi-env]
            [mount.core :as mount]
            [clojure.java.io :as io]))

(defn init! [& {:keys [unload-hook reload-hook watch-dirs] :as _opts
                :or {unload-hook 'before-ns-unload
                     reload-hook 'after-ns-reload
                     watch-dirs ["src" "checkouts" "resources"]}}]
  (imi-logging/init-logging)
  #_{:clj-kondo/ignore [:unresolved-namespace]}
  (mount/start #'imigresen-common.state.db.core/db
               #'imigresen-common.state.flipt.core/flipt
               #'imigresen-common.state.keycloak.core/keycloak)
  (when (imi-env/development? (imi-env/current-env))
    (reload/init {:output :verbose
                  :unload-hook unload-hook
                  :reload-hook reload-hook})
    (let [reload-count (atom 0)]
      (watchtower/watcher watch-dirs
                          (watchtower/rate 20)
                          (watchtower/on-change (fn [files]
                                                  (when (> @reload-count 0)
                                                    (println "files changed: " (map #(.getPath %) files)))
                                                  (reload/reload)
                                                  (swap! reload-count inc)))))))

(defn destroy []
  #_{:clj-kondo/ignore [:unresolved-namespace]}
  (mount/stop #'imigresen-common.state.db.core/db
              #'imigresen-common.state.flipt.core/flipt
              #'imigresen-common.state.keycloak.core/keycloak))

(defn create-server! [atom]
  (reset! atom (let [port (imi-env/env :port (s/or :number number?
                                                   :string imi-env/str->num) 3000)
                     server (adapter/run-jetty core/app {:port port
                                                         :join? false})]
                 (println "Listening on port" port)
                 server)))

(defn create-nrepl-server! [atom]
  (reset! atom (let [port (imi-env/env :nrepl-port (s/or :number number?
                                                         :string imi-env/str->num) 4321)
                     server (nrepl/start-server :port port
                                                :handler cider/cider-nrepl-handler)]
                 (println "nREPL server listening on port" port)
                 (spit ".nrepl-port" port)
                 server)))

(def server (atom nil))

(def nrepl-server (atom nil))

;; from: https://github.com/MichaelBlume/ring-server/blob/master/src/ring/server/standalone.clj#L41C1-L45C16
(defmacro ^{:private true} in-thread
  "Execute the body in a new thread and return the Thread object."
  [& body]
  `(doto (Thread. (fn [] ~@body))
     (.start)))

;; from: https://github.com/MichaelBlume/ring-server/blob/master/src/ring/server/standalone.clj#L47
(defn- add-destroy-hook
  "Add a destroy hook to be executed when the server ends."
  [server destroy]
  (in-thread
   (try (.join server)
        (finally (when destroy (destroy))))))

(defn start! [server nrepl-server]
  (create-server! server)
  (create-nrepl-server! nrepl-server)
  (let [shutdown-hook (fn []
                        (doseq [hook [destroy
                                      (fn [] (io/delete-file ".nrepl-port" true))]]
                          (hook)))]
    (add-destroy-hook @server (. (Runtime/getRuntime)
                                 (addShutdownHook (Thread. shutdown-hook))))))

#_{:clojure-lsp/ignore [:clojure-lsp/unused-public-var]}
(defn before-ns-unload []
  (when @server
    (.stop @server))
  (when @nrepl-server
    (nrepl/stop-server @nrepl-server)))

#_{:clojure-lsp/ignore [:clojure-lsp/unused-public-var]}
(defn after-ns-reload [] (start! server nrepl-server))

(defn -main [& _args]
  (start! server nrepl-server)
  (init!))
