from lxml import etree
import logging
import requests

from models.media import Media
from models.user import User
import private

class ScraperException(Exception):
    pass        

def request_url(url):
    headers = {
        'User-Agent': private.USER_AGENT
    }
    req = requests.get(url, headers=headers, timeout=private.REQUESTS_TIMEOUT)
    xml = req.content.strip()
    tree = etree.fromstring(xml)

    if tree is None or tree.tag != 'myanimelist':
        logging.error('Failed to get xml for ' + url)
        raise ScraperException

    return tree

def get_url(username, medium_type='anime'):
    return 'http://myanimelist.net/malappinfo.php?u=' + username + '&type=' + medium_type

def user_exists_on_mal(username):
    url = get_url(username, 'anime')
    animelist = request_url(url)
    return len(animelist) > 0 and animelist[0].tag == 'myinfo'

def scrape_user(username, medium_type):
    url = get_url(username, medium_type)
    media_list = request_url(url)

    if len(media_list) == 0 or media_list[0].tag != 'myinfo':
        logging.warning('Deleting user "' + username + '"')
        q = User.delete().where(User.username == username)
        q.execute()
        return

    for i in xrange(1, len(media_list) - 1): # Skip first element since it's myinfo
        item = media_list[i]

        if item.tag != medium_type:
            logging.error('Scrapper error on "' + username + '" itemtag:' + item.tag + ' medium:' + medium_type)
            continue

        mal_id = None
        img_url = None

        for prop in item:
            if prop.tag == 'series_' + medium_type + 'db_id':
                mal_id = int(prop.text)
            elif prop.tag == 'series_image':
                img_url = prop.text

        if mal_id is None or img_url is None:
            logging.error('Scrapper error on "' + username + '" mal_id:' + str(mal_id) + ' img_url:' + str(img_url))
            continue

        media_item = Media.select().where((Media.mal_id == mal_id) & (Media.medium_type == medium_type))
        try:
            media_item = media_item.get()
            media_item.img_url = img_url
        except Media.DoesNotExist:
            media_item = Media(img_url=img_url, medium_type=medium_type, mal_id=mal_id)

        media_item.save()
