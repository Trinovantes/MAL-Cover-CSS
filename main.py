from requests.exceptions import RequestException
from flask import Flask, render_template, request, abort, json, make_response

import private

app = Flask(__name__)

#-------------------------------------------------------------------------------
# Database
#-------------------------------------------------------------------------------

from models.user import User, UserDoesNotExistException, UserAlreadyExistsException
from models.media import Media

User.create_table(True) # Generate tables if they don't exist
Media.create_table(True)

#-------------------------------------------------------------------------------
# Celery for Scraper
#-------------------------------------------------------------------------------

from celery import Celery

#-------------------------------------------------------------------------------
# CSS Generator
#-------------------------------------------------------------------------------

from controllers.generator import Generator

@app.route('/covercss')
@app.route('/covercss/<medium_type>')
@app.route('/covercss/<medium_type>/<element_to_style>')
def css(medium_type='all', element_to_style='self'):
    return Generator(medium_type, element_to_style).generate()

#-------------------------------------------------------------------------------
# Main Website
#-------------------------------------------------------------------------------

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add', methods=['POST'])
def add_user():
    result = None
    try:
        username = request.get_json().get('username', '')
        User.create(username=username)
        result = {
            "success": True
        }
    except AttributeError:
        result = {
            "success": False,
            "error": "Bad request"
        }
    except RequestException:
        result = {
            "success": False,
            "error": "Failed to verify \"" + username + "\" on MyAnimeList.com. Please try again later"
        }
    except UserDoesNotExistException:
        result = {
            "success": False,
            "error": "Username \"" + username + "\" does not exist on MyAnimeList.com"
        }
    except UserAlreadyExistsException:
        result = {
            "success": False,
            "error": "Username \"" + username + "\" is already being tracked"
        }

    response = make_response(json.dumps(result))
    response.headers["Content-Type"] = "application/json"
    return response

if __name__ == '__main__':
    app.run(debug=private.IS_DEBUG)
