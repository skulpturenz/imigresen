(ns imigresen-api.core.env
  (:require
   [environ.core]
   [clojure.string]
   [clojure.spec.alpha]))

(defn env
  "Get the value of an environment variable
   
   Specify `spec?` to validate the variable and throw an exception if it is not valid
   Specify a `default-value?` to provide a default value if the variable is `nil`
   
   Environment variables are loaded with `environ`: https://github.com/weavejester/environ"
  ([key] (get key false))
  ([key schema?]
   (let [value (environ.core/env key)]
     (if (clojure.spec.alpha/valid? schema? value)
       (clojure.spec.alpha/conform schema? value)
       (throw (Exception. (clojure.string/join " " ["env" (name keyword) "is not valid"]))))))
  ([key schema? default-value?]
   (let [value (if (nil? (environ.core/env key)) default-value? (environ.core/env key))]
     (if (clojure.spec.alpha/valid? schema? value)
       (clojure.spec.alpha/conform schema? value)
       (throw (Exception. (clojure.string/join " " ["env" (name keyword) "is not valid"])))))))
