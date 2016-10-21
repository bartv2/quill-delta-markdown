import {isEmpty} from 'lodash';
import {without} from 'lodash';

const converters = [
{ filter: 'emph', attribute: 'italic' },
{ filter: 'strong', attribute: 'bold' },
{ filter: 'link', attribute: (node, event, attributes) => {
    if (event.entering) {
        attributes['src'] = node.destination;
    } else {
        attributes = without(attributes, 'src');
    }
    return attributes;
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
                    const attribute = converter.attribute;
                    if (event.entering) {
                        attributes[attribute] = true;
                    } else {
                        attributes = without(attributes, attribute);
                        // add node's children as siblings
                    }
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
