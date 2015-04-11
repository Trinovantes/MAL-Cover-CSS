from peewee import *
from datetime import datetime

from base import BaseModel

class UserAlreadyExistsException(Exception):
    pass

class UserDoesNotExistException(Exception):
    pass

class User(BaseModel):
    uid          = PrimaryKeyField()

    username     = CharField(max_length=200, unique=True)
    created      = DateTimeField(default=datetime.now)
    last_scraped = DateTimeField(null=True)

    class Meta:
        db_table = 'users'

# Generate tables if they don't exist
User.create_table(True)
