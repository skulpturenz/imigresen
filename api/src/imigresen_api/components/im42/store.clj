(ns imigresen-api.components.im42.store
  (:require [honey.sql :as sql]
            [next.jdbc :as jdbc]
            [imigresen-api.state.db.core :refer [db]]
            [pdfboxing.form :as form]))

;; TODO: need to get primary caregiver name
(defn- query-im42 [& filters]
  {:select [:im42.user :im42.uuid :im42.created_at :im42.updated_at
            :personal_details.date_of_birth :personal_details.height :personal_details.phone_number
            :pd_country_of_birth.code :pd_gender.code :pd_relationship_status.code
            :pd_addr.street_address :pd_addr.postcode :pd_addr.city :pd_adr.state :pd_addr_country.code
            :identification_documents.identity_card_number :identification_documents.birth_certificate_number :iddoc_country.code
            :passports.number :passp_country.code
            :primary_caregiver_user.uuid :pc_iddoc.identity_card_number]
   :from [:im42]
   :join [:personal_details [:= :im42.user :personal_details.user]
          :country :pd_country_of_birth [:= :personal_details.country_of_birth :country.code]
          :gender :pd_gender [:= :personal_details.gender :gender.code]
          :relationship_status :pd_relationship_status [:= :personal_details.relationship_status :relationship_status.code]
          :addresses :pd_addr [:= :addresses.user :personal_details.address]
          :country :pd_addr_country [:= :addresses.country :country.code]
          :identification_documents [:= :identification_documents.user :personal_details.user]
          :country :iddoc_country [:= :identification_documents.country :country.code]
          :passports [:= :passports.user :im42.user]
          :country :passp_country [:= :passports.country :country.code]
          :user :primary_caregiver_user [:= :im42.primary_caregiver :user.uuid]
          :identification_documents :pc_iddoc [:= :im42.primary_caregiver :identification_documents.user]]
   :where [:and
           [:is-not :addresses.deleted true]
           [:is-not :passports.deleted true]
           [:is-not :im42.deleted true]
           filters]})

(defn find-by-uuid [uuid]
  (let [query (query-im42 [:= :im42.uuid uuid])]))

(defn find-by-user [user]
  (let [query {:select [:uuid :primary_caregiver :status :created_at :updated_at]
               :from [:im42]
               :where [:and [:is-not :deleted true] [:user user]]}]))

(defn get-reference-data []
  (let [genders-query {:select [:code :gender]
                       :from [:genders]}
        countries-query {:select [:code :country]
                         :from [:countries]}
        relationship-statuses-query {:select [:code :relationship_status]
                                     :from [:relationship_statuses]}]))

(defn upsert-form [form]
  (jdbc/with-transaction [tx (:ds @db)]
    (let [;; TODO: find user and update linked identification documents
          identification-documents-changes (map form [:user :identification-documents.country
                                                      :identification-documents.identity-card-number
                                                      :identification-documents.birth-certificate-number]) ;; TODO: map to db keys
          identification-documents-query! {:insert-into :identification_documents
                                           :columns (keys identification-documents-changes)
                                           :values (vals identification-documents-changes)
                                           :on-conflict {:user {:where [:and
                                                                        [:= :user (:user identification-documents-changes)]
                                                                        [:= :country (:country identification-documents-changes)]]}}
                                           :do-update-set {:fields (keys identification-documents-changes)}}
          upserted-identification-documents (jdbc/execute-one! tx (sql/format identification-documents-query!))
          ;; TODO: map to db keys
          personal-details-changes (map form [:user :personal-details.date-of-birth :personal-details.country-of-birth
                                              :personal-details.gender :address.uuid :personal-details.height
                                              :personal-details.phone-number :personal-details.relationship-status])
          personal-details-query! {:insert-into :personal_details
                                   :columns (keys personal-details-changes)
                                   :values (vals personal-details-changes)
                                   :on-conflict {:user {:where [:= :user (:user personal-details-changes)]}}
                                   :do-update-set {:fields (keys personal-details-changes)}}
          upserted-personal-details (jdbc/execute-one! tx (sql/format personal-details-query!))
          ;; TODO: map to db keys
          address-changes (map form [:user :address.uuid :address.street-address :address.postcode
                                     :address.city :address.state :address.country])
          address-query! {:insert-into :addresses
                          :columns (keys address-changes)
                          :values (vals address-changes)
                          :on-conflict {:user {:where [:and
                                                       [:= :user (:user address-changes)]
                                                       [:= :uuid (:uuid address-changes)]]}}}
          upserted-address (jdbc/execute-one! tx (sql/format address-query!))
          ;; TODO: map to db keys
          ;; TODO: if `identification_documents.uuid` is nil then replace with one above
          im42-changes (merge {:identification_documents (:uuid upserted-identification-documents)}
                              (map form [:user :uuid :identification_documents.uuid :primary_caregiver.uuid]))
          im42-query! {:insert-into :im42
                       :columns (keys im42-changes)
                       :values (vals im42-changes)
                       :on-conflict [:uuid {:where [:= :uuid (:uuid im42-changes)]}]
                       :do-update-set {:fields (keys im42-changes)}
                       :returning [:user :uuid]} ;; TODO: only create, need to handle update
          upserted-im42 (jdbc/execute-one! tx (sql/format im42-query!))])))

;; TODO: in memory?
(defn generate-pdf-document [input output im42]
  ;; TODO: fill in text fields, draw checkmarks
  (form/set-fields input output {}))
