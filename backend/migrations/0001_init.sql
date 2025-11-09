CREATE TABLE users (
                       id serial primary key,
                       email text not null unique,
                       password text not null,
                       created_at timestamptz default now()
);

CREATE TABLE user_banks (
                            id serial primary key,
                            user_id int references users(id),
                            bank_slug text,
                            consent_id text,
                            encrypted_token bytea,
                            token_expiry timestamptz,
                            created_at timestamptz default now()
);

CREATE TABLE accounts (
                          id serial primary key,
                          user_bank_id int references user_banks(id),
                          account_id text,
                          mask text,
                          balance numeric,
                          currency text
);

CREATE TABLE transactions (
                              id serial primary key,
                              account_id int references accounts(id),
                              tx_id text,
                              amount numeric,
                              currency text,
                              timestamp timestamptz,
                              category text,
                              merchant text,
                              raw jsonb
);