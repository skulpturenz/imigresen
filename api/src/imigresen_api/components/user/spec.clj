(ns imigresen-api.components.user.spec
  (:require [clojure.spec.alpha :as s]
            [java-time.api :as jt]
            [clj-uuid :as uuid]))

(defn user [uuid first-name last-name email updated-at created-at]
  {:uuid uuid
   :first-name first-name
   :last-name last-name
   :email email
   :updated-at updated-at
   :created-at created-at})

(s/def :user/uuid uuid/uuid?)
(s/def :user/first-name string?)
(s/def :user/last-name string?)
(s/def :user/email string?)
(s/def :user/updated-at jt/local-date-time?)
(s/def :user/created-at jt/local-date-time?)
(s/def :user/user (s/keys :req [:user/uuid
                                :user/first-name
                                :user/last-name
                                :user/email
                                :user/updated-at
                                :user/created-at]))
