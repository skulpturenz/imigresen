(ns imigresen-api.env
  (:require
   [environ.core]
   [clojure.string]))

(defn get-env
  ([key] (get key false))
  ([key & args]
   (if (not (nil? (environ.core/env key)))
     (environ.core/env key)
     (do (when (and (boolean? (first args)) (first args)) ;; [key strict?]
           (throw (Exception. (clojure.string/join " " ["env" (name keyword) "is undefined"]))))
         (when (and (not (boolean? (first args))) (not (nil? (first args)))) ;; [key default-value]
           (first args))))))
