CREATE TABLE IF NOT EXISTS passports (
    user UUID NOT NULL UNIQUE REFERENCES users(uuid),
    uuid UUID NOT NULL UNIQUE,
    country UUID NOT NULL UNIQUE REFERENCES countries(uuid),
    number TEXT NOT NULL UNIQUE,
    CONSTRAINT pk_passports PRIMARY_KEY(user, uuid)
);
