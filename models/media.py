from google.appengine.ext import db

class Media(db.Model):
    link_url  = db.LinkProperty(required=True)
    cover_url = db.LinkProperty(required=True)
    is_anime  = db.BooleanProperty(required=True) # Otherwise it's manga
