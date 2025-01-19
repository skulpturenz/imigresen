(ns imigresen-api.core.state.flipt
  (:require
   [mount.core])
  (:import
   (io.flipt.api FliptClient)))

(def flipt-agent (agent {}))

(defn start [] (println "Starting"))

(defn stop [] (println "Stopping"))

(mount.core/defstate flipt-state
  :start (start)
  :stop (stop))
