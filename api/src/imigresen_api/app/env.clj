(ns imigresen-api.app.env
  (:require [environ.core]
            [clojure.string :refer [join replace]]
            [clojure.spec.alpha :refer [valid? conform]]))

(def valid-environment? #{"production" "development" "test"})

;; TODO: when reading from env why are there quotes?
(defn env
  "Get the value of an environment variable
   
   Specify `spec?` to validate the variable and throw an exception if it is not valid
   Specify a `default-value?` to provide a default value if the variable is `nil`
   
   Environment variables are loaded with `environ`: https://github.com/weavejester/environ"
  ([key] (let [value (environ.core/env key)]
           (when (not (nil? value))
             (replace (environ.core/env key) "\"" ""))))
  ([key schema?]
   (let [value (env key)]
     (if (valid? schema? value)
       (conform schema? (replace value "\"" ""))
       (throw (Exception. (join " " ["env" (name key) "is not valid"]))))))
  ([key schema? default-value?]
   (let [value (if (nil? (env key)) default-value? (environ.core/env key))]
     (if (valid? schema? value)
       (conform schema? (replace value "\"" ""))
       (throw (Exception. (join " " ["env" (name key) "is not valid"])))))))

(def current-env (env :java-env valid-environment? "development"))
