(ns imigresen-api.state.flipt.mock
  (:require [mount.core :refer [defstate]]
            [imigresen-api.state.flipt.core :refer [start stop enabled? variant]]))

(defstate flipt
  :start (start "https://localhost" "mock")
  :stop (stop))

(defn boolean-evaluation [enabled] {"enabled" enabled})

(defn variant-evaluation [match variant attachment] {"match" match
                                                     "variant-key" variant
                                                     "variant-attachment" attachment})
