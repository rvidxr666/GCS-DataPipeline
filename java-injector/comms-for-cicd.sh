#! /bin/bash

docker build -t gcr.io/marine-catfish-310009/java-injector:latest .
docker push gcr.io/marine-catfish-310009/java-injector:latest
