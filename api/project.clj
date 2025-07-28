;; https://github.com/amperity/lein-monolith/blob/main/example/project.clj

(defproject imigresen.api/all "MONOLITH"
  :description "Overarching example project."

  :aliases
  {"version+" ["version"]
   "version++" ["version+"]
   "install" ["monolith" "each" ":select" ":lib" "install"]}

  :plugins
  [[lein-monolith "LATEST"]
   [lein-pprint "LATEST"]
   [lein-ancient "LATEST"]]

  :dependencies
  [[org.clojure/clojure "1.10.1"]]

  :managed-dependencies
  [[amperity/greenlight "0.6.0"]
   [com.amperity/vault-clj "2.1.583"]]

  :test-selectors
  {:unit (complement :integration)
   :integration :integration}

  :test-paths ^:replace
  ["test/unit"
   "test/integration"]

  :compile-path
  "%s/compiled"

  :monolith
  {:inherit
   [:aliases
    :test-selectors
    :env]

   :inherit-raw
   [:test-paths]

   :inherit-leaky
   [:repositories
    :managed-dependencies]

   :inherit-leaky-raw
   [:compile-path]

   :project-selectors
   {:deployable :deployable
    :lib :lib}

   :project-dirs
   ["imigresen-api"
    "imigresen-mcp-api"
    "imigresen-common"
    "skulpture-eventing"]

   :dependency-sets
   {:set-outdated
    [[amperity/greenlight "0.7.0"]
     [org.clojure/spec.alpha "0.2.194"]]
    :set-a
    [[amperity/greenlight "0.7.1"]
     [org.clojure/spec.alpha "0.3.218"]]}}

  :env
  {:foo "bar"})
