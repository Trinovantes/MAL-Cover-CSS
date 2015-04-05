from datetime import timedelta

from private import CELERY_BROKER_URL, CELERY_RESULT_BACKEND

BROKER_URL = CELERY_BROKER_URL
CELERY_RESULT_BACKEND = CELERY_RESULT_BACKEND

CELERY_TIMEZONE = 'UTC'

CELERYBEAT_SCHEDULE = {
    'scrape_users': {
        'task': 'celeryapp.scraper_task',
        'schedule': timedelta(minutes=1)
    },
}
