CREATE TABLE IF NOT EXISTS countries (
    uuid UUID NOT NULL UNIQUE,
    country TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    CONSTRAINT pk_countries PRIMARY_KEY(uuid, code)
);
