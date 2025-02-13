CREATE TABLE IF NOT EXISTS identification_documents (
    user UUID NOT NULL UNIQUE REFERENCES users(uuid),
    uuid UUID NOT NULL UNIQUE,
    country UUID NOT NULL UNIQUE REFERENCES countries(uuid),
    identity_card_number TEXT,
    birth_certificate_number TEXT, -- birth ceritficate / adoption number / overseas birth cert (borang w)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_identification_documents PRIMARY_KEY(user, uuid, country)
);
