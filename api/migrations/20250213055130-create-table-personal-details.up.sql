CREATE TABLE IF NOT EXISTS personal_details (
    user UUID NOT NULL UNIQUE REFERENCES users(uuid),
    uuid UUID NOT NULL UNIQUE,
    date_of_birth DATE,
    country_of_birth TEXT REFERENCES countries(code),
    gender TEXT REFERENCES genders(code),
    address UUID REFERENCES addresses(uuid),
    height SMALLINT,
    phone_number TEXT,
    relationship_status TEXT REFERENCES relationship_statuses(code),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_personal_details PRIMARY_KEY(user, uuid)
);
