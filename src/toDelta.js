import {isEmpty, unset} from 'lodash';
import console from 'console';
import commonmark from 'commonmark';

function changeAttribute(attributes, event, attribute, value)
{
    if (event.entering) {
        attributes[attribute] = value;
    } else {
        attributes = unset(attributes, attribute);
    }
    return attributes;
}
const converters = [
// inline
{ filter: 'code', attribute: 'code' },
// TODO: underline
// TODO: strike
{ filter: 'emph', attribute: 'italic' },
{ filter: 'strong', attribute: 'bold' },
// TODO: script
{ filter: 'link', attribute: (node, event, attributes) => {
    changeAttribute(attributes, event, 'link', node.destination);
}},
{ filter: 'text', makeDelta: (event, attributes) => {
    if (isEmpty(attributes)) {
        return {insert: event.node.literal};
    } else {
        return {insert: event.node.literal, attributes: {...attributes}};
    }
}},

// block
{ filter: 'block_quote', lineAttribute: true, attribute: 'blockquote' },
{ filter: 'code_block', lineAttribute: true, makeDelta: (event, attributes) => {
    if (!event.entering) {
        return null;
    }
    return { insert: event.node.literal, attributes: {...attributes, 'code-block': true}};
}},
{ filter: 'heading', lineAttribute: true, makeDelta: (event, attributes) => {
    if (event.entering) {
        return null;
    }
    return { insert: "\n", attributes: {...attributes, header: event.node.level}};
}},
{ filter: 'paragraph', lineAttribute: true, makeDelta: (event, attributes) => {
    if (event.entering) {
        return null;
    }

    if (isEmpty(attributes)) {
        return { insert: "\n"};
    } else {
        return { insert: "\n", attributes: {...attributes}};
    }
}},
];

function applyAttribute(node, event, attributes, attribute)
{
    if (typeof attribute == 'string') {
        changeAttribute(attributes, event, attribute, true);
    } else if (typeof attribute == 'function') {
        attribute(node, event, attributes);
    }
}

export default (markdown) => {
    var reader = new commonmark.Parser();
    var parsed = reader.parse(markdown);
    var walker = parsed.walker();
    var event, node;
    var deltas = [];
    var attributes = {};
    var lineAttributes = {};

    while ((event = walker.next())) {
        node = event.node;
        for (var i = 0; i < converters.length; i++) {
            const converter = converters[i];
            if (node.type == converter.filter) {
                if (converter.lineAttribute) {
                    applyAttribute(node, event, lineAttributes, converter.attribute);
                } else {
                    applyAttribute(node, event, attributes, converter.attribute);
                }
                if (converter.makeDelta) {
                    let delta = converter.makeDelta(event, converter.lineAttribute ? lineAttributes : attributes);
                    if (delta) {
                        deltas.push(delta);
                    }
                }
                break;
            }
        }
    }
    if (isEmpty(deltas) || deltas[deltas.length-1].insert.indexOf("\n") == -1) {
        deltas.push({insert: "\n"});
    }

    return deltas;
}
