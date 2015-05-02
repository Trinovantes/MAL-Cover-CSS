from datetime import timedelta

from private import CELERY_BROKER_URL, CELERY_RESULT_BACKEND

#-------------------------------------------------------------------------------

BROKER_URL            = CELERY_BROKER_URL
CELERY_RESULT_BACKEND = CELERY_RESULT_BACKEND

#-------------------------------------------------------------------------------

CELERY_ACCEPT_CONTENT    = ['json']
CELERY_TASK_SERIALIZER   = 'json'
CELERY_RESULT_SERIALIZER = 'json'

#-------------------------------------------------------------------------------

CELERY_TIMEZONE = 'UTC'

CELERY_INCLUDE = ['tasks.scraper', 'tasks.generator']

CELERYBEAT_SCHEDULE = {
    'scrape_users': {
        'task': 'tasks.scraper.scrape_users',
        'schedule': timedelta(minutes=30)
    },
    'generate_css': {
        'task': 'tasks.generator.generate_css',
        'schedule': timedelta(hours=1)
    }
}
