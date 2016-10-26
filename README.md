## Why
I was looking to use QuillJS as a markdown editor, but couldn't find any direct way to input markdown. Wanting to know if there were any blocking issues, i started coding. This is the result, it is not finished, but it is usable to edit markdown using it. 
## Issues
- The conversion from Markdown to Quill delta format needs refactoring, or at least the image conversion should be fixed.
- The code for the conversion to Markdown needs cleanup, also the resulting Markdown needs wrapping of long lines and  could use more line spacing
- More documentation, although the tests explain a lot
- Document how to extend with your own formats
- Build and publish on npm
- Could use quill-delta or parchment to help with the conversions


BTW this text is written using the Quill editor and converted into Markdown with the code
