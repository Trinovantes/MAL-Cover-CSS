from datetime import datetime
from lxml import etree
import logging
import requests

from models.media import Media
import private

class ScraperException(Exception):
    pass        

class Scraper():
    @staticmethod
    def request_url(url):
        headers = {
        'User-Agent': private.USER_AGENT
        }
        req = requests.get(url, headers=headers, timeout=private.REQUESTS_TIMEOUT)
        xml = req.content.strip()
        tree = etree.fromstring(xml)
        return tree

    @staticmethod
    def get_url(username, medium_type='anime'):
        return 'http://myanimelist.net/malappinfo.php?u=' + username + '&type=' + medium_type

    @staticmethod
    def user_exists(username):
        url = Scraper.get_url(username, 'anime')
        animelist = Scraper.request_url(url)
        return len(animelist) > 0 and animelist[0].tag == 'myinfo'
    
    @staticmethod
    def scrape_user(username, medium_type):
        url = Scraper.get_url(username, medium_type)
        media_list = Scraper.request_url(url)
        for item in media_list:
            if item.tag != medium_type:
                continue

            mal_id = None
            img_url = None

            for prop in item:
                if prop.tag == 'series_' + medium_type + 'db_id':
                    mal_id = int(prop.text)
                elif prop.tag == 'series_image':
                    img_url = prop.text

            if mal_id is None or img_url is None:
                logging.error("Scrapper error on \"" + username + "\" mal_id:" + str(mal_id) + " img_url:" + str(img_url))
                continue

            media_item = Media.select().where(Media.mal_id == mal_id)

            try:
                media_item = media_item.get()
                media_item.img_url = img_url
            except Media.DoesNotExist:
                media_item = Media(img_url=img_url, medium_type=medium_type, mal_id=mal_id)

            media_item.last_scraped = datetime.now()
            media_item.save()
