#!/usr/bin/env sh
cd _site
for file in `find . -name "index.html"`; do
	cp "${file}" "${file%.html}-$(git rev-parse HEAD).html"
done
cd ..
