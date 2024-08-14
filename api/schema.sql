CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" varchar(255) NOT NULL UNIQUE,
  "username" varchar(255) NOT NULL,
  "salt" varchar(255) not null,
  "password" varchar(255) NOT NULL,
  "created_at" timestamp default NOW()
);

CREATE TABLE "banks" (
  "id" SERIAL PRIMARY KEY,
  "user_id" integer NOT NULL,
  "title" text NOT NULL,
  "views" integer default 0
);

CREATE TABLE "clues" (
  "id" SERIAL PRIMARY KEY,
  "clue" text NOT NULL,
  "answer" text NOT NULL,
  "user_id" integer NOT NULL,
  -- "date" timestamp default NOW()
  "bank_id" integer NOT NULL,
  "views" integer default 0
);


ALTER TABLE "banks" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "clues" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "clues" ADD FOREIGN KEY ("bank_id") REFERENCES "banks" ("id");