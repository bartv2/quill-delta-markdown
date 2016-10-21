import _ from 'lodash';
import {isEmpty} from 'lodash';
import {without} from 'lodash';

export default (parsed) => {
    var walker = parsed.walker();
    var event, node;
    var deltas = [];
    var attributes = {};

    while ((event = walker.next())) {
        node = event.node;
        if (node.type === 'emph') {
            if (event.entering) {
                attributes = {
                    ...attributes,
                    italic: true
                
                };
            } else {
                attributes = without(attributes, 'italic');
            // add Emph node's children as siblings
            while (node.firstChild) {
                node.insertBefore(node.firstChild);
            }
            // remove the empty Emph node
            node.unlink()
            }
        }
        if (node.type === 'text') {
            if (isEmpty(attributes)) {
                deltas.push({insert: node.literal});
            } else {
                deltas.push({insert: node.literal, attributes});
            }
        }
    }
    if (deltas[deltas.length-1].insert.indexOf("\n") == -1) {
        deltas.push({insert: "\n"});
    }

    return deltas;
}
