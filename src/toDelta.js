import {isEmpty} from 'lodash';
import {without} from 'lodash';

const converters = [
{ filter: 'emph', attribute: 'italic' },
{ filter: 'strong', attribute: 'bold' },
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
                if (converter.attribute) {
                    const attribute = converter.attribute;
                    if (event.entering) {
                        attributes[attribute] = true;
                    } else {
                        attributes = without(attributes, attribute);
                        // add node's children as siblings
                        while (node.firstChild) {
                            node.insertBefore(node.firstChild);
                        }
                        // remove the empty node
                        node.unlink()
                    }
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
