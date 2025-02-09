(ns imigresen-api.components.user.interface
  (:require [imigresen-api.components.user.core :as core]
            [imigresen-api.components.user.store :as store]))

(def find-by-kc-id (partial core/login {:find-by-kc-id store/find-by-kc-id}))

(def register! (partial core/register! {:create-user-by-email! store/create-user-by-email!
                                        :unique-email? store/unique-email?}))

(def update! (partial core/update-user! {:update-user-by-uuid! store/update-user-by-uuid!}))

(def delete! (partial core/delete! {:delete-user! store/delete-user!}))
