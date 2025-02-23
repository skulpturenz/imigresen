(ns imigresen-api.components.im42.store
  (:require [honey.sql :as sql]
            [next.jdbc :as jdbc]
            [imigresen-api.state.db.core :refer [db]]
            [pdfboxing.form :as form])
  (:import (java.io ByteArrayOutputStream)))

;; TODO: need to get primary caregiver name
(defn- query-im42 [& filters]
  {:select [:im42.user :im42.uuid :im42.created-at :im42.updated-at
            :personal-details.date-of-birth :personal-details.height :personal-details.phone-number
            :pd-country-of-birth.code :pd-gender.code :pd-relationship-status.code
            :pd-addr.street-address :pd-addr.postcode :pd-addr.city :pd-adr.state :pd-addr-country.code
            :identification-documents.identity-card-number :identification-documents.birth-certificate-number :iddoc-country.code
            :passports.number :passp-country.code
            :primary-caregiver-user.uuid :pc-iddoc.identity-card-number]
   :from [:im42]
   :join [:personal-details [:= :im42.user :personal-details.user]
          :country :pd-country-of-birth [:= :personal-details.country-of-birth :country.code]
          :gender :pd-gender [:= :personal-details.gender :gender.code]
          :relationship-status :pd-relationship-status [:= :personal-details.relationship-status :relationship-status.code]
          :addresses :pd-addr [:= :addresses.user :personal-details.address]
          :country :pd-addr-country [:= :addresses.country :country.code]
          :identification-documents [:= :identification-documents.user :personal-details.user]
          :country :iddoc-country [:= :identification-documents.country :country.code]
          :passports [:= :passports.user :im42.user]
          :country :passp-country [:= :passports.country :country.code]
          :user :primary-caregiver-user [:= :im42.primary-caregiver :user.uuid]
          :identification-documents :pc-iddoc [:= :im42.primary-caregiver :identification-documents.user]]
   :where [:and
           [:= :addresses.deleted-at nil]
           [:is-not :passports.deleted-at nil]
           [:is-not :im42.deleted-at nil]
           filters]})

(defn find-by-uuid [uuid]
  (let [query (query-im42 [:= :im42.uuid uuid])]))

(defn find-by-user [user]
  (let [query {:select [:uuid :primary-caregiver :status :created-at :updated-at]
               :from [:im42]
               :where [:and [:= :deleted nil] [:user [:select [:uuid]
                                                      :from [:users]
                                                      :where [:and [:= :deleted-at nil] [:= :uuid user]]]]]}]))

(defn get-reference-data []
  (let [genders-query {:select [:code :gender]
                       :from [:genders]}
        countries-query {:select [:code :country]
                         :from [:countries]}
        relationship-statuses-query {:select [:code :relationship-status]
                                     :from [:relationship-statuses]}]))

(defn upsert-form [form]
  (jdbc/with-transaction [tx (:ds @db)]
    (let [;; TODO: find user and update linked identification documents
          user {:select [:uuid]
                :from [:users]
                :where [:and [:= :deleted-at nil] [:user_uuid (:user form)]]}
          form-with-user (assoc form :user (:users/uuid user))
          identification-documents-changes (map form-with-user [:user :identification-documents.country
                                                                :identification-documents.identity-card-number
                                                                :identification-documents.birth-certificate-number]) ;; TODO: map to db keys
          identification-documents-query! {:insert-into :identification-documents
                                           :columns (keys identification-documents-changes)
                                           :values (vals identification-documents-changes)
                                           :on-conflict {:user {:where [:and
                                                                        [:= :user (:user identification-documents-changes)]
                                                                        [:= :country (:country identification-documents-changes)]]}}
                                           :do-update-set {:fields (keys identification-documents-changes)}}
          upserted-identification-documents (jdbc/execute-one! tx (sql/format identification-documents-query!))
          ;; TODO: map to db keys
          personal-details-changes (map form-with-user [:user :personal-details.date-of-birth :personal-details.country-of-birth
                                                        :personal-details.gender :address.uuid :personal-details.height
                                                        :personal-details.phone-number :personal-details.relationship-status])
          personal-details-query! {:insert-into :personal-details
                                   :columns (keys personal-details-changes)
                                   :values (vals personal-details-changes)
                                   :on-conflict {:user {:where [:= :user (:user personal-details-changes)]}}
                                   :do-update-set {:fields (keys personal-details-changes)}}
          upserted-personal-details (jdbc/execute-one! tx (sql/format personal-details-query!))
          ;; TODO: map to db keys
          address-changes (map form-with-user [:user :address.uuid :address.street-address :address.postcode
                                               :address.city :address.state :address.country])
          address-query! {:insert-into :addresses
                          :columns (keys address-changes)
                          :values (vals address-changes)
                          :on-conflict {:user {:where [:and
                                                       [:= :user (:user address-changes)]
                                                       [:= :uuid (:uuid address-changes)]]}}}
          upserted-address (jdbc/execute-one! tx (sql/format address-query!))
          ;; TODO: map to db keys
          ;; TODO: if `identification-documents.uuid` is nil then replace with one above
          im42-changes (merge {:identification-documents (:uuid upserted-identification-documents)}
                              (map form-with-user [:user :uuid :identification-documents.uuid :primary-caregiver.uuid]))
          im42-query! {:insert-into :im42
                       :columns (keys im42-changes)
                       :values (vals im42-changes)
                       :on-conflict [:uuid {:where [:= :uuid (:uuid im42-changes)]}]
                       :do-update-set {:fields (keys im42-changes)}
                       :returning [:user :uuid]} ;; TODO: only create, need to handle update
          upserted-im42 (jdbc/execute-one! tx (sql/format im42-query!))])))

(defn generate-pdf-document [input im42]
  ;; TODO: fill in text fields, draw checkmarks
  ;; Checkbox - Off/On
  ;; TODO: text fields where box around we need one text field per char
  (with-open [out (ByteArrayOutputStream.)]
    (form/set-fields input out {})))

(def ^:private form-fields {:doc-type-64 ""
                            :doc-type-32 ""
                            :doc-type-limited-sg ""
                            :doc-type-limited-bn ""
                            :doc-type-emergency ""
                            :doc-type-limited-id ""
                            :doc-type-limited-ph ""
                            :doc-type-travel-limited ""
                            :req-type-first ""
                            :req-type-full-expired ""
                            :req-type-destroyed ""
                            :req-type-child-picture ""
                            :req-type-lost ""})
