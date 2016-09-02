#!/usr/bin/env sh
cd _site
for file in *.html; do
	cp "${file}" "${file%.html}-$(git rev-parse HEAD).html"
done
cd ..
