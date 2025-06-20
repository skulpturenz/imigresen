(ns imigresen-api.components.user.interface-spec
  (:require [clojure.spec.alpha :as s]
            [imigresen-api.components.user.interface :as interface]))

(s/fdef interface/find-by-kc-id
  :args (s/cat :kc-id string?)
  :ret (s/get-spec :user/user))

(s/fdef interface/register!
  :args (s/cat :user (s/get-spec :user/new-user))
  :ret (s/get-spec :user/user))

(s/fdef interface/update!
  :args (s/cat :user (s/get-spec :user/update-user))
  :ret (s/get-spec :user/user))

(s/fdef interface/delete!
  :args (s/cat :uuid (s/get-spec :user/uuid))
  :ret boolean?)
