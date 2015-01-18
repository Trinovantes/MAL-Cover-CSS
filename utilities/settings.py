import os
import logging
from google.appengine.api import taskqueue

#------------------------------------------------------------------------------
# Debug
#------------------------------------------------------------------------------

DISABLE_LOGGING = 'DISABLE_LOGGING' in os.environ
if (DISABLE_LOGGING):
    logging.basicConfig(level=logging.CRITICAL)

DEBUG = 'development' in os.environ.get('SERVER_SOFTWARE', '').lower()

#------------------------------------------------------------------------------
# Globals
#------------------------------------------------------------------------------

TEST_USERNAME         = 'trinovantes'
HEADER_USERNAME_KEY   = 'username'
HEADER_MEDIA_URL_KEY  = 'media-url'
HEADER_MEDIA_NAME_KEY = 'media-name'

user_queue  = taskqueue.Queue('user-queue')
media_queue = taskqueue.Queue('media-queue')
