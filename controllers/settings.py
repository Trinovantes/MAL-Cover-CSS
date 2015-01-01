import os
import logging

DISABLE_LOGGING = 'DISABLE_LOGGING' in os.environ
if (DISABLE_LOGGING):
    logging.basicConfig(level=logging.CRITICAL)

DEBUG = 'development' in os.environ.get('SERVER_SOFTWARE', '').lower()
