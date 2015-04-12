import logging
from datetime import datetime
from datetime import timedelta

from celeryapp import celeryapp
from tasks.scraper import scrape_user, ScraperException
from models.user import User

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@celeryapp.task
def scraper_task():
    cutoff = datetime.now() - timedelta(days=1)
    users_to_scrape = User.select().where((User.last_scraped >> None) | (User.last_scraped < cutoff))
    try:
        count = 0
        for user in users_to_scrape:
            scrape_user(user.username, 'anime')
            scrape_user(user.username, 'manga')
            
            user.last_scraped = datetime.now()
            user.save()

            count += 1
            logging.info('Finished scraping user "' + user.username + '"')

        return count

    except ScraperException:
        logging.error('Failed to scrape user "' + user.username + '"')
        return -1
