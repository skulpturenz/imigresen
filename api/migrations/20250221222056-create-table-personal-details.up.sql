CREATE TABLE IF NOT EXISTS personal_details (
    user_uuid UUID NOT NULL UNIQUE REFERENCES users(uuid),
    uuid UUID NOT NULL UNIQUE,
    date_of_birth DATE,
    country_of_birth_code TEXT REFERENCES countries(code),
    gender_code TEXT REFERENCES genders(code),
    address_uuid UUID REFERENCES addresses(uuid),
    height SMALLINT,
    phone_number TEXT,
    relationship_status_code TEXT REFERENCES relationship_statuses(code),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_personal_details PRIMARY KEY(user_uuid, uuid)
);
--;;
CREATE OR REPLACE TRIGGER personal_details_modtimestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    WHEN (OLD IS DISTINCT FROM NEW)
        EXECUTE PROCEDURE moddatetime (updated_at)
