from datetime import timedelta

from private import CELERY_BROKER_URL, CELERY_RESULT_BACKEND

#-------------------------------------------------------------------------------

BROKER_URL            = CELERY_BROKER_URL
CELERY_RESULT_BACKEND = CELERY_RESULT_BACKEND

#-------------------------------------------------------------------------------

CELERY_ACCEPT_CONTENT  = ['json']
CELERY_TASK_SERIALIZER = 'json'

#-------------------------------------------------------------------------------

CELERY_TIMEZONE = 'UTC'

CELERY_INCLUDE = ['tasks.scraper_task']

CELERYBEAT_SCHEDULE = {
    'scrape_users': {
        'task': 'tasks.scraper_task.scraper_task',
        'schedule': timedelta(minutes=1)
    },
}
