CREATE TABLE IF NOT EXISTS users (
    kc_id TEXT NOT NULL,
    uuid UUID NOT NULL,
    email TEXT,
    deleted BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
);
