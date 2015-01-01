import settings
import helpers

class UserScraper():
    def __init__(self, username):
        self.username = username

    def run(self):
        list_soup = request_soup('http://myanimelist.net/animelist/' + self.username)
        
