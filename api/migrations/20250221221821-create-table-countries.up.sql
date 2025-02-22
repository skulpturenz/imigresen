CREATE TABLE IF NOT EXISTS countries (
    code TEXT NOT NULL UNIQUE,
    country TEXT NOT NULL UNIQUE,
    CONSTRAINT pk_countries PRIMARY KEY(code)
);
