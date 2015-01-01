from datetime import timedelta
from datetime import datetime
from google.appengine.api import taskqueue
import webapp2
import logging

from models.user import User
from models.media import Media
from scraper_media import MediaScraper
from scraper_user import UserScraper
import settings

#------------------------------------------------------------------------------
# MediaHandler
#------------------------------------------------------------------------------

class MediaHandler(webapp2.RequestHandler):
    def post(self):
        rel_url = self.request.get(settings.HEADER_MEDIA_URL_KEY)
        scraper = MediaScraper(rel_url)
        scraper.run()

#------------------------------------------------------------------------------
# UserHandler
#------------------------------------------------------------------------------

class UserHandler(webapp2.RequestHandler):
    def post(self):
        username = self.request.get(settings.HEADER_USERNAME_KEY)
        scraper = UserScraper(username)

        # Will dispatch a bunch of scraper jobs into media_queue which will then be handled by MediaHandler
        # Number of jobs depends on the media item's existence in database (anime/manga) and how many the user has
        scraper.run()

#------------------------------------------------------------------------------
# SchedulerHandler
#------------------------------------------------------------------------------

class SchedulerHandler(webapp2.RequestHandler):
    def get(self):
        if settings.DEBUG:
            logging.info('Running Scheduler - Debug')
            test_user = User.all().filter('username =', settings.TEST_USERNAME).get()
            if test_user is None:
                test_user = User(username=settings.TEST_USERNAME, scrape_anime=True, scrape_manga=True)
                test_user.put()
            users = [test_user]
        else:
            logging.info('Running Scheduler - Production')
            more_than_a_day_ago = datetime.now() - timedelta(seconds=-settings.delay_seconds)
            user_query = User.all()
            user_query.filter('last_scraped <', more_than_a_day_ago)
            user_query.filter('exists =' + True)
            users = user_query.fetch(limit=None)

        if users is not None:
            logging.info('Scheduling scrapper on ' + str(len(users)) + ' user(s)')
            for user in users:
                settings.user_queue.add(taskqueue.Task(
                    url = '/scraper/user',
                    params = {
                        settings.HEADER_USERNAME_KEY: user.username
                    }
                ))
