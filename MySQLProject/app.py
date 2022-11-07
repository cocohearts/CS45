from flask import Flask, render_template, request
from datetime import datetime
from flask_mysqldb import MySQL

app = Flask(__name__)
app.config['MYSQL_HOST'] = 'mysql.2223.lakeside-cs.org'
app.config['MYSQL_USER'] = 'student2223'
app.config['MYSQL_PASSWORD'] = 'm545CS42223'
app.config['MYSQL_DB'] = '2223playground'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
mysql = MySQL(app)

@app.route('/')
def index():
    # impose minimum order time
    now_string = datetime.now().strftime('%Y-%m-%dT%H:%M')

    return render_template('index.html.j2',now_string = now_string)
    
@app.route('/results', methods = ['POST'])
def results():
    """ Returns result page for a single order, links to past orders """
    name = request.values.get("fullname")
    animal = request.values.get("animal")
    method = request.values.get("method")
    rareness = request.values.get("rareness")
    flavors = request.values.getlist("flavor")
    raw_datetime = request.values.get("delivery_time")

    # error message or dish name
    msg = getDish(animal, method, rareness, flavors)

    # server-side validation
    error = checkError(animal, method, rareness, flavors)

    # try formatting time
    try:
        order_datetime = datetime.strptime(raw_datetime,'%Y-%m-%dT%H:%M')
    except:
        # check for higher-priority error
        if not error:
            error = 1
            msg = "You submitted an invalid time format."
    
    # check for order in the past
    if not error and order_datetime < datetime.now():
        error = 1
        msg = "You attempted to order with an arrival time in the past."

    if error:
        return render_template('results.html.j2', missing_val = error, msg = msg, name = name)

    # rewrite into string
    order_time = order_datetime.strftime("%I:%M %p on %B %d, %Y")

    cursor = mysql.connection.cursor()
    query = "INSERT INTO `alexzhao_orders`(`ordername`, `order_datetime`, `order_given_datetime`, `name`) VALUES (%s,%s,%s,%s)"
    queryVars = (msg,order_datetime,datetime.today(),name)
    cursor.execute(query, queryVars)
    mysql.connection.commit()

    return render_template('results.html.j2', name = name, msg = msg, time = order_time, missing_val = error,
        orders_url = "./orders?fullname=" + name)

@app.route('/orders')
def orders():
    name = request.args.get("fullname")
    cursor = mysql.connection.cursor()
    query = "SELECT * FROM alexzhao_orders WHERE name = %s ORDER BY id;"
    queryVars = (name,)
    cursor.execute(query, queryVars)
    mysql.connection.commit()
    data = cursor.fetchall()

    orders = getDishOrderTime(data)

    # in case of URL hacking:
    if not orders:
        orders = ["You have no orders in our database."]
    
    return render_template('orders.html.j2', fullname = name, orders = orders)

def getDishOrderTime(data):
    """ processes list of maps into list of past order strings """
    orders = []
    for order_map in data:
        order_datetime = order_map['order_datetime']
        # datetime the order was given
        order_given_datetime = order_map['order_given_datetime']
        # rewriting into strings
        order_given_date_str = order_given_datetime.strftime("%B %d, %Y,")
        order_datetime_str = order_datetime.strftime("%I:%M %p on %B %d, %Y.")
        
        # combining elements into one string
        order_arr = ["On",
                order_given_date_str,
                "you ordered a",
                order_map['ordername'] + ",",
                "and it arrived at",
                order_datetime_str]
        if datetime.now() < order_datetime:
            # checking for past orders
            order_arr[4] = "and it will arrive at"
        newstr = " ".join(order_arr)
        orders.append(newstr)

    return orders

def checkError(animal, method, rareness, flavors):
    """ server-side validation for empty strings """
    if not animal or not method or not rareness or not flavors:
        return True

    return False

def getDish(animal, method, rareness, flavors):
    """ processes order inputs and returns either a dish name or an error message """

    # maps flavor to spice
    spice_dict = {
        "sweet": "honey",
        "salty": "Himalayan sea salt",
        "spicy": "red chili powder"
    }

    # checking for error messages
    if not animal:
        return "No animal specified."

    elif not method:
        return "No cooking method specified."

    elif not rareness:
        return "No rareness specified."
    
    elif not flavors:
        return "No flavors specified."

    # this list will be joined with spaces
    return_list = [method, animal, "of rareness", str(rareness)]

    # string describing all necessary spices, with commas
    spices_str = ""

    # casework by number of flavors
    if len(flavors) == 1:
        spices_str = spice_dict[flavors[0]]

    elif len(flavors) == 2:
        spices_str = " ".join([spice_dict[flavors[0]],"and",spice_dict[flavors[1]]])

    elif len(flavors) == 3:
        spices_str = ", ".join([spice_dict[flavors[0]],spice_dict[flavors[1]],"and "+spice_dict[flavors[2]]])
    
    # add spices to our list of words
    if flavors:
        return_list += ["with",spices_str]

    return_str = " ".join(return_list)
    # no errors
    return return_str