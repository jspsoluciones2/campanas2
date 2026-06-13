.PHONY: dev-api dev-web install-api

install-api:
	pip install -r services/python/requirements.txt

dev-api:
	python services/python/run.py

dev-web:
	npm run dev --workspace=web
