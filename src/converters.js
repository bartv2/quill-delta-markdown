import isEmpty from 'lodash/isEmpty';
import { changeAttribute } from  './toDelta';

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
{ filter: 'list', lineAttribute: true, attribute: (node, event, attributes) => {
    changeAttribute(attributes, event, 'list', node.listType);
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

// embeds
{ filter: 'image', attribute: (node, event, attributes) => {
    changeAttribute(attributes, event, 'image', node.destination);
    if (node.title) {
        changeAttribute(attributes, event, 'title', node.title);
    }
}},

];

export default converters;
