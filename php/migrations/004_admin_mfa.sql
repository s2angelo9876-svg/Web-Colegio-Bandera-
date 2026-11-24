ALTER TABLE accounts
    ADD COLUMN mfa_secret text CHECK (mfa_secret ~ '^[0-9a-f]{120}$'),
    ADD COLUMN mfa_last_step bigint CHECK (mfa_last_step >= 0),
    ADD CHECK ((mfa_secret IS NULL) = (mfa_last_step IS NULL));

ALTER TABLE sessions ADD COLUMN mfa_verified boolean NOT NULL DEFAULT false;
