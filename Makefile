release:
	TAG=$(git describe --tags "${LATEST_TAG_COMMIT}")
	git push --tags
	gh release create "${TAG}"
	git push
patch:
	npm version patch
	make release
minor:
	npm version minor
	make release
major:
	npm version major
	make release
