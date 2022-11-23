from ast import excepthandler
from pickle import TRUE
from xmlrpc.client import Boolean
from flask import Flask, render_template, request
from flask_mysqldb import MySQL
import flask
import json
from google.oauth2 import id_token
from google.auth.transport import requests
import pprint
from datetime import datetime

app = Flask(__name__)
app.config['MYSQL_HOST'] = 'mysql.2223.lakeside-cs.org'
app.config['MYSQL_USER'] = 'student2223'
app.config['MYSQL_PASSWORD'] = 'm545CS42223'
app.config['MYSQL_DB'] = '2223project'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

app.secret_key = 'super secret key'
app.config['SESSION_TYPE'] = 'filesystem'

CLIENT_ID = "753064515997-khqc7lo9ucovnskefcr5n11c8njrb16e.apps.googleusercontent.com"

mysql = MySQL(app)

"""
Structure
Main pages:
    Index is directory root, with game canvas
        Offer leaderboard
        If not logged in, say "log in to save your score"
        If logged in, offer profile, logout

    Profile has past scores and change username
        Offers gamepage and leaderboard
        Default username is email
        Can change username

    Leaderboard contains top scores, with logged-in scores highlighted if logged in

All main pages can link to other main pages

Login pages:
    Login redirects to profile
    OAuth2 assists login, sets cookies
    Logout does something, redirects to main page
"""

@app.route('/')
def index():
    logged_in = Boolean('email' in flask.session)
    # logged_in = False
    # print(flask.session['email'])
    return render_template('index.html.j2',loggedIn = logged_in)

@app.route('/logout')
def logout():
    flask.session.clear()
    return flask.redirect("../", code=302)

@app.route('/savescore', methods=['POST'])
def savescore():
    score = request.values.get("score")
    if score == -1:
        score = None
    else:
        flask.session['score'] = score

    if ('email' in flask.session):
        email_id = flask.session['id']
        email = flask.session['email']
        nowstring = datetime.now().strftime('%Y-%m-%dT%H:%M')
        print([str(email_id),datetime.now(),score])
        SQL_Query(
            "INSERT INTO `alexzhao_scores`(`email`, `score_datetime`, `score`) VALUES (%s,%s,%s)",
            (email,datetime.now(),score,)
        )

    return "done"

@app.route('/leaderboard', methods=['POST'])
def leaderboard():
    logged_in = Boolean('email' in flask.session)
    history = None
    score = request.values.get("score")
    flask.session['score'] = str(score)
    play_pos = "1st"
    if logged_in:
        if not verify():
            flask.session.clear()
            return render_template('/')
        history = SQL_Query(
            "SELECT * FROM `alexzhao_scores` WHERE email=%s;",
            (flask.session['email'],)
        )
        play_pos = get_ordinal(len(history))


    return render_template('leaderboard.html.j2',score=score, play_ordinal=play_pos,loggedIn=logged_in,history=history)

@app.route('/profile', methods=['GET'])
def profile():
    logged_in = Boolean('id' in flask.session)
    if logged_in:
        if not verify():
            flask.session.clear()
            return render_template('/')

        email = flask.session['email']
        email_id = flask.session['id']
        # print(email_id)
        account = SQL_Query(
            "SELECT * FROM `alexzhao_accounts` WHERE email=%s;",
            (email,)
        )
        username = account[0]['username']
        
        history = SQL_Query(
            "SELECT * FROM `alexzhao_scores` WHERE email=%s;",
            (email,)
        )
        print(history)

        game_list = []
        for game_map in history:
            new_time = game_map['score_datetime'].strftime("%I:%M %p on %B %d, %Y")
            new_game = [new_time, game_map['score']]
            game_list.append(new_game)
    else:
        email, game_list, username = None
    
    print(game_list)
    return render_template('profile.html.j2',loggedIn = logged_in, email = email, game_list=game_list, username=username)

@app.route('/oauth2', methods = ['POST','GET'])
def oauth2():
    token = request.values.get("token")

    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        flask.session['token'] = token

        email_id = idinfo['sub']
        email = idinfo['email']

        flask.session['id'] = email_id
        flask.session['email'] = email

        account = SQL_Query(
            "SELECT * FROM `alexzhao_accounts` WHERE email=%s;",
            (email,)
        )
        if (not account):
            SQL_Query(
                "INSERT INTO `alexzhao_accounts`(`email`, `username`) VALUES (%s,%s)",
                (email,email,)
            )

    except ValueError:
        print("Invalid token")
    
    return "complete"

@app.route('/login', methods=['GET'])
def login():
    logged_in = Boolean('email' in flask.session)
    return render_template('login.html.j2',loggedIn=logged_in)

def verify():
    token = flask.session['token']
    email = flask.session['email']

    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        return idinfo['email'] == email

    except:
        return False

def get_ordinal(n):
    # copied
    if 11 <= (n % 100) <= 13:
        suffix = 'th'
    else:
        suffix = ['th', 'st', 'nd', 'rd', 'th'][min(n % 10, 4)]
    return str(n) + suffix

def SQL_Query(query, queryVars):
    cursor = mysql.connection.cursor()
    cursor.execute(query, queryVars)
    mysql.connection.commit()
    data = cursor.fetchall()
    return data

def convert_time(raw_datetime):
    try:
        my_datetime = datetime.strptime(raw_datetime,'%Y-%m-%dT%H:%M')
        return my_datetime.strftime("%I:%M %p on %B %d, %Y")
    except:
        return None