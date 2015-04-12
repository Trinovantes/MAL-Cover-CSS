from requests.exceptions import RequestException
from flask import Flask, render_template, request, abort, json, make_response
from flask_limiter import Limiter
from flask.ext.cache import Cache

from models.user import User, UserDoesNotExistException, UserAlreadyExistsException
from models.media import Media
import private

flaskapp = Flask(__name__)
limiter = Limiter(flaskapp)
cache = Cache(flaskapp, config={'CACHE_TYPE': 'redis'})

#-------------------------------------------------------------------------------
# CSS Generator
#-------------------------------------------------------------------------------

from controllers.generator import Generator

@flaskapp.route('/covercss')
@flaskapp.route('/covercss/<medium_type>')
@flaskapp.route('/covercss/<medium_type>/<element_to_style>')
@cache.cached(timeout=3600)
def css(medium_type='all', element_to_style='self'):
    return Generator(medium_type, element_to_style).generate()

#-------------------------------------------------------------------------------
# Main Website
#-------------------------------------------------------------------------------

from tasks.scraper import user_exists_on_mal

@flaskapp.route('/add', methods=['POST'])
@limiter.limit("9/hour")
@limiter.limit("3/minute")
def add_user():
    result = None
    try:
        username = request.get_json().get('username', '')        
        if User.select().where(User.username == username).exists():
            raise UserAlreadyExistsException
        if not user_exists_on_mal(username):
            raise UserDoesNotExistException
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

@flaskapp.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    flaskapp.run(debug=private.IS_DEBUG)
