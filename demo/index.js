import toDelta from '../src/toDelta.js';
require('./style.css');
import Quill from 'quill';
import '../node_modules/quill/dist/quill.snow.css';
import _ from 'lodash';

var input = document.getElementById('input');
var output = document.getElementById('output');
input.addEventListener('keydown', _.debounce(onInputChange), 500);

var quill = new Quill('#editor-container', {
  modules: {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'link'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['image', 'code-block','blockquote']
    ]
  },
  placeholder: 'Compose an epic...',
  theme: 'snow' // or 'bubble'
});
quill.on('text-change', function() {
    var contents = quill.getContents();
//     console.log(contents);
    output.innerText = JSON.stringify(contents.ops, null, 2);
});
onInputChange();

function onInputChange() {
    var contents = toDelta(input.value);
    quill.setContents(contents);
    input.nextElementSibling.innerText = JSON.stringify(contents, null, 2);
}
