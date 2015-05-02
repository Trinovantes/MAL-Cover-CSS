print-%: ; @echo $*=$($*)

.PHONY: debug-beat debug-worker clean

debug-worker:
	celery worker --app=celeryapp --loglevel=INFO

debug-beat:
	celery beat --app=celeryapp --loglevel=INFO

clean:
	find -name '*.pyc' | xargs rm -f
	rm -f celerybeat.pid celerybeat-schedule dump.rdb

