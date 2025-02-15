(ns imigresen-api.components.im42.store)

(defn- query-im42 [& filters]
  {:select [:im42.user :im42.uuid :im42.created_at :im42.updated_at
            :personal_details.date_of_birth :personal_details.height :personal_details.phone_number
            :pd_country_of_birth.code :pd_gender.code :pd_relationship_status.code
            :pd_addr.street_address :pd_addr.postcode :pd_addr.city :pd_adr.state :pd_addr_country.code
            :identification_documents.identity_card_number :identification_documents.birth_certificate_number :iddoc_country.code
            :passports.number :passp_country.code]
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
          :country :passp_country [:= :passports.country :country.code]]
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
