CREATE TABLE IF NOT EXISTS personal_details (
    user UUID NOT NULL UNIQUE REFERENCES users(uuid),
    uuid UUID NOT NULL UNIQUE,
    date_of_birth DATE,
    country_of_birth UUID REFERENCES countries(uuid),
    gender UUID REFERENCES genders(uuid),
    address UUID REFERENCES addresses(uuid),
    height SMALLINT,
    phone_number TEXT,
    relationship_status UUID REFERENCES relationship_statuses(uuid),
    CONSTRAINT pk_personal_details PRIMARY_KEY(user, uuid)
);
