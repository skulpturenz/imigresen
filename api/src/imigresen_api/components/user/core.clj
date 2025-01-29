(ns imigresen-api.components.user.core)

(defn login [_deps _uuid] (println "Login"))

(defn register! [_deps _user] (println "Register"))

(defn delete! [_deps _uuid] (println "Delete"))
