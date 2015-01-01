import webapp2

from controllers import settings
from controllers import css
from controllers import scraper
from controllers import homepage

application = webapp2.WSGIApplication([

    # Defaults: /css/[username]/all/self
    ('/css/(\w+)',                                       css.Handler),
    ('/css/(\w+)/(all|anime|manga)',                     css.Handler),
    ('/css/(\w+)/(all|anime|manga)/(self|before|after)', css.Handler),

    ('/scraper/media',      scraper.MediaHandler),
    ('/scraper/user',       scraper.UserHandler),
    ('/scraper/scheduler',  scraper.SchedulerHandler),

    ('/', homepage.MainPage)

], debug = settings.DEBUG)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
