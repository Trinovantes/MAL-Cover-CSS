from datetime import datetime
from google.appengine.ext import db

class Media(db.Model):
    last_scraped = db.DateTimeProperty(default=datetime.fromtimestamp(0))

    rel_url    = db.StringProperty(required=True)  # Relative link to myanimelist.net
    cover_path = db.LinkProperty()                 # Abs path to image
    is_anime   = db.BooleanProperty(required=True) # Otherwise it's manga
