from peewee import *
from base import BaseModel

class Media(BaseModel):
    mid          = PrimaryKeyField()

    last_scraped = DateTimeField(null=True)
    img_url      = CharField(max_length=200) # http://cdn.myanimelist.net/images/anime/12/28009.jpg
    medium_type  = CharField(max_length=10)  # anime
    mal_id       = IntegerField()            # 9989

    class Meta:
        db_table = 'media'
