(ns imigresen-api.env
  (:require
   [environ.core]
   [clojure.string]))

(defn get-env
  "Get the value of an environment variable
   
   Specify `strict` to throw an exception if the variable is `nil` or provide a `default-value`
   
   Environment variables are loaded with `environ`: https://github.com/weavejester/environ"
  {:arglists `([key]
               [key strict?]
               [key default-value])}
  ([key] (get key false))
  ([key & args]
   (if (not (nil? (environ.core/env key)))
     (environ.core/env key)
     (do (when (and (boolean? (first args)) (first args)) ;; [key strict?]
           (throw (Exception. (clojure.string/join " " ["env" (name keyword) "is undefined"]))))
         (when (and (not (boolean? (first args))) (not (nil? (first args)))) ;; [key default-value]
           (first args))))))
