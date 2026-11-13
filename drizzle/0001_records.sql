CREATE TABLE records (
  owner TEXT NOT NULL,
  id TEXT NOT NULL,
  day TEXT NOT NULL,
  payload TEXT NOT NULL,
  revision INTEGER NOT NULL,
  PRIMARY KEY (owner, id)
);
CREATE INDEX records_owner_day ON records(owner, day DESC);

