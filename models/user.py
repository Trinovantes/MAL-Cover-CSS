from datetime import datetime
from google.appengine.ext import db

class User(db.Model):
    created      = db.DateTimeProperty(auto_now_add=True)
    last_scraped = db.DateTimeProperty(default=datetime.fromtimestamp(0))

    username     = db.StringProperty(required=True)
    scrape_anime = db.BooleanProperty(default=False)
    scrape_manga = db.BooleanProperty(default=False)
    media_list   = db.ListProperty(db.Key)
