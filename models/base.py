from peewee import *
from private import MYSQL_DATABASE, MYSQL_PASSWORD, MYSQL_USERNAME

database = MySQLDatabase(MYSQL_DATABASE, **{'passwd': MYSQL_PASSWORD, 'user': MYSQL_USERNAME})

class BaseModel(Model):
    class Meta:
        database = database
