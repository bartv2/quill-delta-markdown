import {isEmpty, unset} from 'lodash';
import commonmark from 'commonmark';
import converters from './converters';

export function changeAttribute(attributes, event, attribute, value)
{
    if (event.entering) {
        attributes[attribute] = value;
    } else {
        attributes = unset(attributes, attribute);
    }
    return attributes;
}

function applyAttribute(node, event, attributes, attribute)
{
    if (typeof attribute == 'string') {
        changeAttribute(attributes, event, attribute, true);
    } else if (typeof attribute == 'function') {
        attribute(node, event, attributes);
    }
}

function toDelta(markdown) {
    var parsed = toDelta.commonmark.parse(markdown);
    var walker = parsed.walker();
    var event, node;
    var deltas = [];
    var attributes = {};
    var lineAttributes = {};

    while ((event = walker.next())) {
        node = event.node;
        for (var i = 0; i < toDelta.converters.length; i++) {
            const converter = toDelta.converters[i];
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

toDelta.commonmark = new commonmark.Parser();
toDelta.converters = converters;

export default toDelta;
