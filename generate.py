import sys
import re
import logging
import urllib2
import errno
from time import sleep
from socket import error as SocketError

sys.path.insert(0, 'libs') # Add /libs/ folder to $PATH
from bs4 import BeautifulSoup

from controllers import private

#-------------------------------------------------------------------------------
# Config
#-------------------------------------------------------------------------------

USERNAME        = 'trinovantes'
PSEUDO_SELECTOR = ':before'
GET_ANIME       = True
GET_MANGA       = True
OUTPUT_FILE     = 'myanimelist-covers.css'
SLEEP_DELAY     = 4
START_INDEX     = -1

#-------------------------------------------------------------------------------
# Functions
#-------------------------------------------------------------------------------

def request_soup(url):
    logging.debug('Requesting ' + url)
    headers  = { 'User-Agent' : private.USER_AGENT }
    request  = urllib2.Request(url, None, headers)

    counter = 0
    while (True):
        try:
            delay = SLEEP_DELAY * pow(2, counter)
            logging.debug('Sleeping for ' + str(delay) + ' s')
            sleep(delay) # Don't DDOS

            response = urllib2.urlopen(request)
            page     = response.read()
            return BeautifulSoup(page)
        except SocketError as e:
            if e.errno != errno.ECONNRESET:
                raise # Not error we are looking for
            else:
                counter = counter + 1

def scrape_media(rel_url, media_name):
    soup = request_soup('http://myanimelist.net' + rel_url)
    img = soup.find('div', id='content').select('img[src^=http://cdn.myanimelist.net/images/' + media_name + '/]')
    img_src = img[0]['src']
    return img_src

def scrape_list(is_anime):
    output_file = open(OUTPUT_FILE, 'a')
    regex = re.compile('\/[a-z]+\/[0-9]+\/')

    media_list = ''
    media_name = ''

    if is_anime:
        media_list = 'animelist'
        media_name = 'anime'
    else:
        media_list = 'mangalist'
        media_name = 'manga'

    url = 'http://myanimelist.net/' + media_list + '/' + USERNAME
    soup = request_soup(url)

    links = soup.select('a[href^=/' + media_name + '/]')
    logging.info('Found ' + str(len(links)) + ' link(s) for ' + media_name)

    counter = 0
    for link in links:
        if counter > START_INDEX:
            rel_url = link['href']
            img_src = scrape_media(rel_url, media_name)

            # Generate CSS
            if is_anime:
                css_rule = '.animetitle'
            else:
                css_rule = '.animetitle' # MAL is weird...
            css_rule += '[href*="' + regex.search(rel_url).group(0) + '"]' + PSEUDO_SELECTOR
            css_rule += '{background-image:url(' + img_src + ');}'
            output_file.write(css_rule)

            # Write to log
            logging.info('[' + str(counter) + '] ' + img_src)

        counter = counter + 1

#-------------------------------------------------------------------------------
# Actual Program
#-------------------------------------------------------------------------------

# Setup logging
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
ch.setFormatter(formatter)
logger.addHandler(ch)

if GET_ANIME:
    scrape_list(is_anime=True)

if GET_MANGA:
    scrape_list(is_anime=False)
