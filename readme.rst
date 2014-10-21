Arrest
======

Arrest is a reStructuredText parser written for NodeJS. It generates a document tree from an RST document, and can convert that tree to HTML or other formats.

This parser is not compliant with the full RST spec, and probably won't be any time soon. It's intended to cover the 90% case that I have for it, which is to replace Markdown as the documentation and article generation syntax for my projects. Anything beyond this (tables, exotic directives, etc.) will be implemented only as needed, although I'll happily accept pull requests to add them.