CREATE TABLE IF NOT EXISTS passports (
    user UUID NOT NULL UNIQUE REFERENCES users(uuid),
    uuid UUID NOT NULL UNIQUE,
    country TEXT NOT NULL UNIQUE REFERENCES countries(code),
    number TEXT NOT NULL UNIQUE,
    deleted BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_passports PRIMARY_KEY(user, uuid)
);
