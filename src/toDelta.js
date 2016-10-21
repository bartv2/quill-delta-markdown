import {isEmpty} from 'lodash';
import {without} from 'lodash';

function changeAttribute(attributes, event, attribute, value)
{
    if (event.entering) {
        attributes[attribute] = value;
    } else {
        attributes = without(attributes, attribute);
    }
    return attributes;
}
const converters = [
{ filter: 'emph', attribute: 'italic' },
{ filter: 'strong', attribute: 'bold' },
{ filter: 'link', attribute: (node, event, attributes) => {
    return changeAttribute(attributes, event, 'src', node.destination);
}},
{ filter: 'text', makeDelta: (node, attributes) => {
    if (isEmpty(attributes)) {
        return {insert: node.literal};
    } else {
        return {insert: node.literal, attributes};
    }
}}
];

export default (parsed) => {
    var walker = parsed.walker();
    var event, node;
    var deltas = [];
    var attributes = {};

    while ((event = walker.next())) {
        node = event.node;
        for (var i = 0; i < converters.length; i++) {
            const converter = converters[i];
            if (node.type == converter.filter) {
                if (typeof converter.attribute == 'string') {
                    attributes = changeAttribute(attributes, event, converter.attribute, true);
                } else if (typeof converter.attribute == 'function') {
                    attributes = converter.attribute(node, event, attributes);
                }
                if (converter.makeDelta) {
                    deltas.push(converter.makeDelta(node, attributes));
                }
            }
        }
    }
    if (isEmpty(deltas) || deltas[deltas.length-1].insert.indexOf("\n") == -1) {
        deltas.push({insert: "\n"});
    }

    return deltas;
}
