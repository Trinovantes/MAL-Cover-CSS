from google.appengine.api import urlfetch

import sys
sys.path.insert(0, 'libs') # Add /libs/ folder to $PATH
from bs4 import BeautifulSoup

import settings
import logging

#------------------------------------------------------------------------------

def request_soup(url):
    result = urlfetch.fetch(
        url,
        headers = {'User-Agent': 'MyAnimeList CSS Generator Bot (https://github.com/Trinovantes/MyAnimeList-CSS-Generator)'}
    )

    if result.status_code == 200:
        return BeautifulSoup(result.content)
    else:
        logging.error('Received ' +  str(result.status_code) + ' error from ' + url)
        return None
