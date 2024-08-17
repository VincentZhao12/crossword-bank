from flask import Flask, jsonify, request
import psycopg2
from dotenv import load_dotenv
import os
import jwt
import bcrypt
import datetime
from sklearn.metrics.pairwise import cosine_similarity
import difflib
from flask_cors import CORS
import functools

from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

SIGNUP_USER = "INSERT INTO users (id, email, username, password, salt) VALUES (DEFAULT, %s, %s, %s, %s) RETURNING id"
SELECT_LOGIN = "SELECT id, password, salt FROM users WHERE email = %s"

CREATE_BANK = "INSERT INTO banks (id, user_id, title) VALUES (DEFAULT, %s, %s) RETURNING id"
SELECT_EDITORS = "SELECT user_id FROM banks WHERE id = %s"
CREATE_CLUE = "INSERT INTO clues (id, clue, answer, user_id, bank_id) VALUES (DEFAULT, %s, %s, %s, %s)"

SELECT_BANKS = "SELECT * FROM banks"
SELECT_BANKS_USER = "SELECT * FROM banks WHERE user_id = %s"
SELECT_CLUES = "SELECT * FROM clues WHERE 1 = 1"
SELECT_CLUES_USER = "SELECT * FROM clues WHERE user_id = %s"
SELECT_CLUES_BANK = "SELECT * FROM clues WHERE bank_id = %s"
SELECT_CLUE = "SELECT * FROM clues WHERE id = %s"

CHECK_BANK_OWNERSHIP = "SELECT * FROM banks WHERE id = %s AND user_id = %s"

DELETE_BANK = "DELETE FROM banks WHERE id = %s"
DELETE_CLUE = "DELETE FROM clues WHERE id = %s"
DELETE_CLUE_BANK = "DELETE FROM clues WHERE bank_id = %s"

load_dotenv()

hostname = os.getenv("DATABASE_HOST")
port = os.getenv("DATABASE_PORT")
user = os.getenv("DATABASE_USER")
password = os.getenv("DATABASE_PASSWORD")

app = Flask(__name__)

cors = CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'
app.config["AUTH_SECRET_KEY"] = os.getenv("JWT_SECRET")

def execute(query, params, fetch="none"):
    with psycopg2.connect(host=hostname, port=port, user=user, password=password) as connection:
        connection.autocommit = True
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            if fetch == "one":
                return cursor.fetchone()
            elif fetch == "all":
                return cursor.fetchall()

@app.route("/sign-up", methods=["POST"])
def signup():
    email = request.json.get("email")
    name = request.json.get("name")
    password = request.json.get("password")

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
        user_id = execute(SIGNUP_USER, (email, name, hashed_password.decode("utf-8"), salt.decode("utf-8")), "one")
        token = jwt.encode({'user_id': user_id[0], "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, app.config["AUTH_SECRET_KEY"])
        
        print("token: ", token)
    except Exception as e:
        print("An exception occurred: ", e)
        return jsonify({"message": "email already exists"}), 400

        
    return jsonify({'token': token}), 200

@app.route("/log-in", methods=["POST"])
def login():
    email = request.json.get("email")
    password = request.json.get("password")
    
    if not email:
        return jsonify({"message": "email is required"}), 400
    if not password:
        return jsonify({"message": "password is required"}), 400
    
    res = execute(SELECT_LOGIN, [email], "one")
    
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
    token = request.json.get("token")
    title = request.json.get("title")

    user_id = check_auth(token)
    if user_id <= 0:
        return jsonify({"message": "valid auth token required"}), 400
    
    if not title:
        return jsonify({"message": "title required"}), 400
    
    try:
        bank_id = execute(CREATE_BANK, (user_id, title), "one")[0]
    except Exception as e:
        print("error", e)
        return jsonify({"message": "error occurred creating bank"}), 500
    return jsonify({"bank_id": bank_id, "message": "bank created"}), 200

@app.route("/add-clue", methods=["POST"])
def add_clue():
    token = request.json.get("token")
    bank_id = request.json.get("bank_id")
    clue = request.json.get("clue")
    answer = request.json.get("answer")
    # date = request.json.get("date")
    
    user_id = check_auth(token)
    
    if user_id <= 0:
        return jsonify({"message": "valid auth token required"}), 400
    
    if not bank_id:
        return jsonify({"message": "bank_id required"}), 400
    if not clue:
        return jsonify({"message": "clue required"}), 400
    if not answer:
        return jsonify({"message": "answer required"}), 400
    
    res = execute(SELECT_EDITORS, [bank_id], "one")
    
    print(res)
    
    if not res:
        return jsonify({"message": "bank doesn't exist"}), 400
    
    owner = res[0]
    
    if user_id != owner:
        return jsonify({"message": "user cannot modify clue bank"}), 400
    
    try:
        execute(CREATE_CLUE, (clue, answer, user_id, bank_id), "none")
    except Exception as e:
        print("error", e)
        return jsonify({"message": "error occurred creating clue"}), 500
    
    return jsonify({"message": "success"}), 200
    
@app.route("/get-banks", methods=["POST"])
def get_banks():
    user_id = request.json.get("user_id")
    if not user_id:
        token = request.json.get("token")
        user_id = check_auth(token)
        if user_id <= 0:
            user_id = None
        
    if not user_id:
        try:
            res = execute(SELECT_BANKS, "all")
        except:
            return jsonify({"message": "error occurred fetching clue"}), 500
        return jsonify({"data": [{
            "bank_id": row[0],
            "user_id": row[1],
            "title": row[2]
        } for row in res]})

    try:
        res = execute(SELECT_BANKS_USER, [user_id], "all")
    except:
        return jsonify({"message": "error occurred fetching banks"}), 500
    return jsonify({"data": [{
        "bank_id": row[0],
        "user_id": row[1],
        "title": row[2]
    } for row in res]})
    
@app.route("/check-owner", methods=["POST"])
def check_owner():
    token = request.json.get("token")
    bank_id = request.json.get("bank_id")
    
    user_id = check_auth(token)
    
    if not bank_id or user_id < 0:
        return jsonify({"message": "error occurred fetching banks"}), 400
    
    try:
        res = execute(CHECK_BANK_OWNERSHIP, (bank_id, user_id), "all")
        print(res)
        if res:
            return jsonify({"message": "yup", "data": True}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "error occurred fetching banks"}), 500
    
    return jsonify({"message": "you are not owner", "data": False}), 400
    
@app.route("/get-clues", methods=["GET", "POST"])
def get_clues():
    user_id = request.json.get("user_id")
    bank_id = request.json.get("bank_id")
    length = request.json.get("length")
    search_term = request.json.get("search_term")
    
    if user_id and bank_id:
        return jsonify({"message": "only filter by one at once"}), 400
    query = SELECT_CLUES
    args = []
    if bank_id:
        query = SELECT_CLUES_BANK
        args = [bank_id]
    elif user_id:
        query = SELECT_CLUES_USER
        args = [user_id]
        
    if length:
        args.append(length)
        query += " AND LENGTH(answer) = %s"
    
    print(query)
    
    try:
        res = execute(query, args, "all")
    except Exception  as e:
        print(e)
        return jsonify({"message": "error occurred fetching clues"}), 500
    
    if not res:
        print("no clues cuz", query)
        return jsonify({"message": "no clues found matching"}), 400
    
    data = [{
        "id": row[0],
        "clue": row[1],
        "answer": row[2],
    } for row in res]
    
    if not search_term:
        return jsonify({"data": data}), 200
    
    clues = [row[1] for row in res]
    
    clue_embeddings = model.encode(clues)
    search_embedding = model.encode([search_term])
    
    semantic_scores = cosine_similarity(search_embedding, clue_embeddings)[0]
    matching_scores = [difflib.SequenceMatcher(None, search_term, clue).ratio() for clue in clues]
    
    scores = [0.8 * semantic_scores[i] + 0.2 * matching_scores[i] for i in range(len(clues))]
    
    res = sorted(zip(scores, data), key=lambda x: x[0], reverse=True)
    return jsonify({"data": [row[1] for row in res if row[0] > 0.1]}), 200
    
@app.route("/delete-bank", methods=["POST"])
def delete_bank():
    token = request.json.get("token")
    bank_id = request.json.get("bank_id")
    
    user_id = check_auth(token)
    
    if user_id <= 0:
        return jsonify({"message": "valid auth token required"}), 400
    if not bank_id:
        return jsonify({"message": "bank_id required"}), 400
    
    res = execute(SELECT_EDITORS, [bank_id], "one")
    
    print(res)
    
    if not res:
        return jsonify({"message": "bank doesn't exist"}), 400
    
    owner = res[0]
    
    if user_id != owner:
        return jsonify({"message": "user cannot modify clue bank"}), 400
    
    try:
        execute(DELETE_CLUE_BANK, (bank_id), "none")
        execute(DELETE_BANK, (bank_id), "none")
    except Exception as e:
        print("error", e)
        return jsonify({"message": "error occurred deleting bank"}), 500
    
    return jsonify({"message": "success"}), 200
        
@app.route("/delete-clue", methods=["POST"])
def delete_clue():
    token = request.json.get("token")
    clue_id = request.json.get("clue_id")
    
    user_id = check_auth(token)
    
    if user_id <= 0:
        return jsonify({"message": "valid auth token required"}), 400
    if not clue_id:
        return jsonify({"message": "clue_id required"}), 400
    
    res = execute(SELECT_CLUE, [clue_id], "one")
    
    print(res)
    
    if not res:
        return jsonify({"message": "clue doesn't exist"}), 400
    
    owner = res[0]
    
    if user_id != owner:
        return jsonify({"message": "user cannot modify clue bank"}), 400
    
    try:
        execute(DELETE_CLUE, (clue_id), "none")
    except Exception as e:
        print("error", e)
        return jsonify({"message": "error occurred deleting clue"}), 500
    
    return jsonify({"message": "success"}), 200