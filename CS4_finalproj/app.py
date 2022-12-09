from ast import excepthandler
from pickle import TRUE
from xmlrpc.client import Boolean
from flask import Flask, render_template, request
from flask_mysqldb import MySQL
import flask
from google.oauth2 import id_token
from google.auth.transport import requests
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
    flask.session['score'] = None
    logged_in = Boolean('email' in flask.session)
    return render_template('index.html.j2',loggedIn = logged_in)

@app.route('/leaderboard', methods=['POST','GET'])
def leaderboard():
    logged_in = Boolean('email' in flask.session)

    history = None
    score = None
    play_pos = None

    if logged_in:
        if not verify():
            flask.session.clear()
            return flask.redirect("/", code=302)

        history = SQL_Query(
            "SELECT * FROM `alexzhao_scores` WHERE email=%s;",
            (flask.session['email'],)
        )

    if ('score' in flask.session):
        score = flask.session['score']
        if history and score:
            play_pos = ordinal(len(history))
    
    leaderboard = SQL_Query(
        "SELECT scores.score, accounts.username, scores.score_datetime FROM `alexzhao_scores` scores JOIN `alexzhao_accounts` accounts ON scores.email = accounts.email ORDER BY score DESC LIMIT 10;",
        ()
    )
    leaderboard_list = []
    for game_map in leaderboard:
        new_time = game_map['score_datetime'].strftime("%I:%M %p, %m/%d/%Y")
        new_game = [game_map['username'], game_map['score'], new_time]
        leaderboard_list.append(new_game)

    return render_template('leaderboard.html.j2',score=score, play_ordinal=play_pos,loggedIn=logged_in,leaderboard=leaderboard_list)

@app.route('/profile', methods=['GET','POST'])
def profile():
    logged_in = Boolean('email' in flask.session)
    if logged_in:
        if not verify():
            flask.session.clear()
            return render_template('/')

        email = flask.session['email']

        if flask.request.method == 'POST':
            username = flask.request.values.get('new_username')
            SQL_Query(
                "UPDATE `alexzhao_accounts` SET `username`=%s WHERE `email`=%s",
                (username,email)
            )

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
        email = None
        game_list = None
        username = None
    
    print(game_list)
    return render_template('profile.html.j2',loggedIn = logged_in, email = email, game_list=game_list[::-1], username=username)

@app.route('/login', methods=['GET'])
def login():
    logged_in = Boolean('email' in flask.session)
    return render_template('login.html.j2',loggedIn=logged_in)

@app.route('/username', methods=['GET'])
def username():
    logged_in = Boolean('email' in flask.session)
    return render_template('username.html.j2',loggedIn=logged_in)

@app.route('/help', methods=['GET'])
def help():
    logged_in = Boolean('email' in flask.session)
    return render_template('help.html.j2',logged_in=logged_in)

@app.route('/logout', methods=['GET'])
def logout():
    flask.session.clear()
    return flask.redirect("/", code=302)

@app.route('/savescore', methods=['POST'])
def savescore():
    score = request.values.get("score")
    if score == -1:
        score = None
    else:
        flask.session['score'] = score

    if ('email' in flask.session):
        email = flask.session['email']
        SQL_Query(
            "INSERT INTO `alexzhao_scores`(`email`, `score_datetime`, `score`) VALUES (%s,%s,%s)",
            (email,datetime.now(),score,)
        )

    return "complete"

@app.route('/oauth2', methods = ['POST','GET'])
def oauth2():
    token = request.values.get("token")

    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        flask.session['token'] = token

        email = idinfo['email']

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

def verify():
    token = flask.session['token']
    email = flask.session['email']

    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        return idinfo['email'] == email

    except:
        return False

def ordinal(n):
    if 11 <= (n % 100) <= 13:
        suffix = 'th'

    else:
        suffixes = ['th', 'st', 'nd', 'rd', 'th']
        suffix = suffixes[min(4, n % 10)]

    return str(n) + suffix

def SQL_Query(query, queryVars=()):
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