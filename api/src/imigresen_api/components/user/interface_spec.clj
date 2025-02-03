(ns imigresen-api.components.user.interface-spec
  (:require [clojure.spec.alpha :as s]))

(s/fdef login
  :args (s/cat :kc-id string?)
  :ret (s/get-spec :user/user))

(s/fdef register!
  :args (s/cat :user (s/get-spec :user/new-user))
  :ret (s/get-spec :user/user))

(s/fdef update!
  :args (s/cat :user (s/get-spec :user/update-user))
  :ret (s/get-spec :user/user))

(s/fdef delete-user!
  :args (s/cat :uuid (s/get-spec :user/uuid))
  :ret boolean?)
