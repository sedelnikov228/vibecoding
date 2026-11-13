CREATE TABLE IF NOT EXISTS exercises (
  owner TEXT NOT NULL,
  exercise_key TEXT NOT NULL,
  title TEXT NOT NULL,
  PRIMARY KEY (owner, exercise_key)
);

CREATE TRIGGER IF NOT EXISTS exercises_after_insert AFTER INSERT ON records
WHEN json_extract(NEW.payload, '$.kind') = 'workout'
BEGIN
  INSERT OR IGNORE INTO exercises
  SELECT NEW.owner, json_extract(value, '$.key'), json_extract(value, '$.title')
  FROM json_each(NEW.payload, '$.exercises');
END;

CREATE TRIGGER IF NOT EXISTS exercises_after_update AFTER UPDATE OF payload ON records
WHEN json_extract(NEW.payload, '$.kind') = 'workout'
BEGIN
  INSERT OR IGNORE INTO exercises
  SELECT NEW.owner, json_extract(value, '$.key'), json_extract(value, '$.title')
  FROM json_each(NEW.payload, '$.exercises');
END;
