CREATE TABLE IF NOT EXISTS addresses (
    user UUID NOT NULL REFERENCES users(uuid),
    uuid UUID NOT NULL UNIQUE,
    street_address TEXT,
    postcode TEXT,
    city TEXT,
    state TEXT,
    country REFERENCES countries(uuid),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_addresses PRIMARY_KEY(user, uuid)
);
