from flask import Flask
import psycopg2
from dotenv import load_dotenv
import os

CREATE = "CREATE TABLE IF NOT EXISTS test (id SERIAL PRIMARY KEY, name TEXT);"
INSERT = "INSERT INTO test (name) VALUES (%s) RETURNING id;"
SELECT = "SELECT * FROM test;"

load_dotenv()

hostname = os.getenv("DATABASE_HOST")
port = os.getenv("DATABASE_PORT")
user = os.getenv("DATABASE_USER")
password = os.getenv("DATABASE_PASSWORD")

connection = psycopg2.connect(host=hostname, port=port, user=user, password=password)

app = Flask(__name__)