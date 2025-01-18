(ns state.pg
  (:require
   [mount.core]
   [environ.core]
   [pg.core]
   [clojure.string]
   [pg.migrations.core]))

;; TODO: parse connection string
(def config {:host (environ.core/env :pg-host)
             :port (environ.core/env :pg-port)
             :user (environ.core/env :pg-user)
             :password (environ.core/env :pg-password)
             :database (environ.core/env :pg-database)
             :use-ssl (environ.core/env :pg-use-ssl)
             :migrations-table (clojure.string/join "-" [(environ.core/env :pg-migrations-table) (environ.core/env :java-env)])
             :migrations-path (environ.core/env :pg-migrations-path)})

(mount.core/defstate pg
  :start ((pg.core/connect config) (pg.migrations.core/migrate-all config))
  :stop (pg.core/close config))
