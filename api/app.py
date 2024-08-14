from flask import Flask, jsonify, request
import psycopg2
from dotenv import load_dotenv
import os
import jwt
import bcrypt
import datetime


from sentence_transformers import SentenceTransformer

# 1. Load a pretrained Sentence Transformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

SIGNUP_USER = "INSERT INTO users (id, email, username, password, salt) VALUES (DEFAULT, %s, %s, %s, %s) RETURNING id"
SELECT_LOGIN = "SELECT id, password, salt FROM users WHERE email = %s"

CREATE_BANK = "INSERT INTO banks (id, user_id, title) VALUES (DEFAULT, %s, %s, %s) RETURNING id"
SELECT_EDITORS = "SELECT user_id FROM banks WHERE id = %s"
CREATE_CLUE = "INSERT INTO clues (id, clue, answer, user_id, bank_id) VALUES (DEFAULT, %s, %s, %s, %s)"

SELECT_BANKS = "SELECT * FROM banks"
SELECT_CLUES = "SELECT * FROM clues"
SELECT_CLUES_USER = "SELECT * FROM clues where user_id = %s"
SELECT_CLUES_BANK = "SELECT * FROM clues where bank_id = %s"

load_dotenv()

hostname = os.getenv("DATABASE_HOST")
port = os.getenv("DATABASE_PORT")
user = os.getenv("DATABASE_USER")
password = os.getenv("DATABASE_PASSWORD")

connection = psycopg2.connect(host=hostname, port=port, user=user, password=password)
connection.autocommit = True
cursor = connection.cursor()

app = Flask(__name__)
app.config["AUTH_SECRET_KEY"] = os.getenv("JWT_SECRET")

@app.route("/sign-up", methods=["POST"])
def signup():
    email = request.json["email"]
    name = request.json["name"]
    password = request.json["password"]

    if not email:
        return jsonify({"message": "email is required"}), 400
    if not name:
        return jsonify({"message": "name is required"}), 400
    if not password:
        return jsonify({"message": "password is required"}), 400
    
    if len(email) > 255:
        return jsonify({"message": "email too long"}), 401
    if len(name) > 255:
        return jsonify({"message": "email too long"}), 401
    
    
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    try:
        cursor.execute(SIGNUP_USER, (email, name, hashed_password.decode("utf-8"), salt.decode("utf-8")))
        user_id = cursor.fetchone()
        token = jwt.encode({'user_id': user_id[0], "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, app.config["AUTH_SECRET_KEY"])
        
        print("token: ", token)
    except Exception as e:
        print("An exception occurred: ", e)
        return jsonify({"message": str(e)}), 400

        
    return jsonify({'token': token}), 200

@app.route("/log-in", methods=["POST"])
def login():
    email = request.json["email"]
    password = request.json["password"]
    
    if not email:
        return jsonify({"message": "email is required"}), 400
    if not password:
        return jsonify({"message": "password is required"}), 400
    
    cursor.execute(SELECT_LOGIN, [email])
    res = cursor.fetchone()
    
    if not res:
        return jsonify({"message": "email not found"}), 400
    [id, hashed_pw, salt] = res
    
    check_pw = bcrypt.hashpw(password.encode("utf-8"), salt.encode("utf-8"))
    print(check_pw)
    print(res)
    
    if hashed_pw == check_pw.decode("utf-8"):
        token = jwt.encode({'user_id': id, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, app.config["AUTH_SECRET_KEY"])
        return jsonify({"token": token}), 200
    return jsonify({"message": "wrong password"}), 400

def check_auth(token):
    if not token:
        return -1
    
    try:
        data = jwt.decode(token, app.config["AUTH_SECRET_KEY"], algorithms=["HS256"])
    except Exception as e:
        print(e)
        return -2
    return data["user_id"]

@app.route("/create-bank", methods=["POST"])
def create_bank():
    token = request.json["token"]
    title = request.json["title"]

    user_id = check_auth(token)
    if user_id <= 0:
        return jsonify({"message": "valid auth token required"}), 400
    
    if not title:
        return jsonify({"message": "title required"}), 400
    
    try:
        cursor.execute(CREATE_BANK, (user_id, title))
        bank_id = cursor.fetchone()[0]
    except:
        return jsonify({"message": "error occurred creating bank"}), 500
    return jsonify({"bank_id": bank_id, "message": "bank created"}), 200

@app.route("/add-clue", methods=["POST"])
def add_clue():
    token = request.json["token"]
    bank_id = request.json["bank_id"]
    clue = request.json["clue"]
    answer = request.json["answer"]
    # date = request.json["date"]
    
    user_id = check_auth(token)
    
    if user_id <= 0:
        return jsonify({"message": "valid auth token required"}), 400
    
    if not bank_id:
        return jsonify({"message": "bank_id required"}), 400
    if not clue:
        return jsonify({"message": "clue required"}), 400
    if not answer:
        return jsonify({"message": "answer required"}), 400
    
    cursor.execute(SELECT_EDITORS, [bank_id])
    res = cursor.fetchone()
    
    print(res)
    
    if not res:
        return jsonify({"message": "bank doesn't exist"}), 400
    
    owner = res[0]
    
    if user_id != owner:
        return jsonify({"message": "user cannot modify clue bank"}), 400
    
    try:
        cursor.execute(CREATE_CLUE, (clue, answer, user_id, bank_id))
    except:
        return jsonify({"message": "error occurred creating bank"}), 500
    
    return jsonify({"message": "success"}), 200
    
@app.route("/get-clues", methods=["GET"])
def get_clues():
    user_id = request.json["user_id"]
    bank_id = request.json["bank_id"]
    search_term = request.json["search_term"]