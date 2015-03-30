from peewee import *
from datetime import datetime

from base import BaseModel
from tasks.scraper import Scraper

class UserAlreadyExistsException(Exception):
    pass

class UserDoesNotExistException(Exception):
    pass

class User(BaseModel):
    uid          = PrimaryKeyField()

    username     = CharField(max_length=200, unique=True)
    created      = DateTimeField(default=datetime.now)
    last_scraped = DateTimeField(null=True)

    def __init__(self, username):
        if User.select().where(User.username == username).exists():
            raise UserAlreadyExistsException
        if not Scraper.user_exists(username):
            raise UserDoesNotExistException

        super(User, self).__init__()
        self.username = username

    class Meta:
        db_table = 'users'
