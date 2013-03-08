GENERATED_FILES = \
	package.json \
	dsv.min.js

all: $(GENERATED_FILES)

.PHONY: all clean test

clean:
	rm -rf -- $(GENERATED_FILES)

dsv.min.js: dsv.js
	node_modules/.bin/uglifyjs $< -c -m -o $@

test:
	node_modules/.bin/vows

package.json: ./package dsv.js
	@rm -f $@
	./package > $@
	@chmod a-w $@
