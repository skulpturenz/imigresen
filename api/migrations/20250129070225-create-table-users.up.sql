CREATE TABLE IF NOT EXISTS users (
    kc_id TEXT NOT NULL UNIQUE,
    uuid UUID NOT NULL UNIQUE,
    email TEXT NOT NULL,
    deleted BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY(kc_id, uuid, email)
);
