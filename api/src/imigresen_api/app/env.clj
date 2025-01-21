(ns imigresen-api.app.env
  (:require
   [environ.core]
   [clojure.string :only [join]]
   [clojure.spec.alpha :only [valid? conform]]))

(def valid-environment? #{"production" "development"})

(defn env
  "Get the value of an environment variable
   
   Specify `spec?` to validate the variable and throw an exception if it is not valid
   Specify a `default-value?` to provide a default value if the variable is `nil`
   
   Environment variables are loaded with `environ`: https://github.com/weavejester/environ"
  ([key] (environ.core/env key))
  ([key schema?]
   (let [value (env key)]
     (if (valid? schema? value)
       (conform schema? value)
       (throw (Exception. (join " " ["env" (name key) "is not valid"]))))))
  ([key schema? default-value?]
   (let [value (if (nil? (env key)) default-value? (environ.core/env key))]
     (if (valid? schema? value)
       (conform schema? value)
       (throw (Exception. (join " " ["env" (name key) "is not valid"])))))))

(def current-env (env :java-env valid-environment? "development"))
