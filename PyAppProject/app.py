from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html.j2')
    
@app.route('/results', methods=['POST'])
def results():
    # grab all values
    name = request.values.get("fullname")
    animal = request.values.get("animal")
    method = request.values.get("method")
    rareness = request.values.get("rareness")
    flavors = request.values.getlist("flavor")
    time = request.values.get("delivery_time")

    # process values
    package = getDish(animal, method, rareness, flavors)

    # error message or dish name
    msg = package[0]

    # package[1] indicates error
    missing_val = package[1]

    if not missing_val:
        time = getTime(time)

    return render_template('results.html.j2', name=name, msg=msg, time=time, missing_val = missing_val)

def getDish(animal, method, rareness, flavors):
    """
        getDish processes the data and returns a package with a message and a error boolean
        Return type tuple
    """

    # maps flavor to spice
    spice_dict = {
        "sweet": "honey",
        "salty": "Himalayan sea salt",
        "spicy": "red chili powder"
    }

    # checking for errors, error boolean set to True
    if not animal:
        return ("No animal specified", True)

    elif not method:
        return ("No cooking method specified", True)

    elif not rareness:
        return ("No rareness specified", True)
    
    elif not flavors:
        return ("No flavors specified", True)

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
    return (return_str, False)

def getTime(time_24):
    """ Processes a 24-hour time string into a 12-hour time string """

    if int(time_24[:2]) >= 13:
        return str(int(time_24[:2])-12) + time_24[2:] + " PM"

    elif int(time_24[:2]) == 12:
        return time_24 + " PM"

    elif int(time_24[:2]) == 0:
        return "12" + time_24[2:] + " AM"

    else:
        return time_24 + " AM"