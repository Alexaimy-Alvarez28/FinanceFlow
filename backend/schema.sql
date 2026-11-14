CREATE TABLE IF NOT EXISTS transactions (
 id BIGSERIAL PRIMARY KEY,
 description VARCHAR(80) NOT NULL,
 amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
 type VARCHAR(10) NOT NULL CHECK (type IN ('income','expense')),
 category VARCHAR(60) NOT NULL,
 date DATE NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date DESC);
CREATE TABLE IF NOT EXISTS github_favorites (
 id BIGSERIAL PRIMARY KEY,
 github_id BIGINT NOT NULL UNIQUE,
 full_name VARCHAR(255) NOT NULL,
 html_url TEXT NOT NULL,
 description TEXT,
 language VARCHAR(100),
 stars INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Perfiles guardados para análisis posterior en DevInsight.
CREATE TABLE IF NOT EXISTS github_profiles (
 id BIGSERIAL PRIMARY KEY,
 github_id BIGINT NOT NULL UNIQUE,
 login VARCHAR(100) NOT NULL,
 name VARCHAR(255),
 avatar_url TEXT,
 html_url TEXT NOT NULL,
 followers INTEGER NOT NULL DEFAULT 0,
 public_repos INTEGER NOT NULL DEFAULT 0,
 saved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
