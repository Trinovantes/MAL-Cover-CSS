from datetime import datetime
from google.appengine.api import taskqueue
import logging

from models.user import User
from models.media import Media
from utilities import settings
from utilities import helpers

class UserScraper():
    def __init__(self, username):
        self.username = username

    def run(self):
        self.user = User.all().filter('username =', self.username).get()

        if self.user is None:
            logging.error('User is None: ' + self.username)
            return

        if not self.user.exists:
            logging.error('Trying to scrape a non-existent user: ' + self.username)
            return

        # Actual url doesn't matter, just need to check if the user exists
        list_soup = helpers.request_soup('http://myanimelist.net/animelist/' + self.username)

        if list_soup.find('div', class_='badresult'):
            # User not found, mark this user for deletion later
            # Marked to be deleted later so we don't have to make as many requests to MAL to check if they exist
            logging.warning('User does not exist: ' + self.username)
            self.user.exists = False
        else:
            # Sends 0-2 requests to get user lists
            if self.user.scrape_anime:
                self.scrape_list(is_anime_list=True, page_soup=list_soup)
            if self.user.scrape_manga:
                self.scrape_list(is_anime_list=False)

            # Update last_scraped date
            self.user.last_scraped = datetime.now()

        # Save changes to user
        self.user.put()

    def scrape_list(self, is_anime_list, page_soup=None):
        if is_anime_list:
            media_list = 'animelist'
            media_name = 'anime'
        else:
            media_list = 'mangalist'
            media_name = 'manga'
    
        if page_soup is None:
            url = 'http://myanimelist.net/' + media_list + '/' + self.username
            soup = helpers.request_soup(url)
        else:
            soup = page_soup

        # Iterate over all the links on user list and schedule them to be scraped if they're not in the database yet
        links = soup.select('a[href^=/' + media_name + '/]')
        logging.debug('Found ' + str(len(links)) + ' link(s)')

        for link in links:
            rel_url = link['href']
            if len(rel_url) > 500:
                # Longer than GAE's allowable string length
                logging.error('URL longer than 500 characters: ' + rel_url)
                return

            # First check if this media item is already in db
            media = Media.all().filter('rel_url =', rel_url).get()
            if media is None:
                # It doesn't exist so schedule it
                logging.info('Media does not exist in database: ' +  rel_url)

                media = Media(rel_url=rel_url, is_anime=is_anime_list)
                media.put()

                settings.media_queue.add(taskqueue.Task(
                    url = '/scraper/user',
                    params = {
                        settings.HEADER_MEDIA_URL_KEY: rel_url,
                        settings.HEADER_MEDIA_NAME_KEY: media_name
                    }
                ))
            else:
                # It exists so do nothing
                logging.debug('Media exists in database: ' +  rel_url)

            # Finally add this to user's media list if it doesn't exist in it yet
            if media.key() not in self.user.media_list:
                self.user.media_list.append(media.key())
                self.user.put()
