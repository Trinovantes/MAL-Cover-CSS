from celery import Celery

celeryapp = Celery()
celeryapp.config_from_object('celeryconfig')

if __name__ == '__main__':
    celeryapp.start()
