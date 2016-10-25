var cheerio = require('cheerio');
        var _ = require('lodash');

exports = module.exports = function(ops) {
    return _.trimEnd(convert(ops).render()) + "\n";
};
var id = 0;
function node(data)
{
    this.id = ++id;
    if (_.isArray(data)) {
        this.open = data[0];
        this.close = data[1];
    } else if (_.isString(data)) {
        this.text = data;
    } else {
//         this.close = "\n";
    }
    this.children = [];
}
node.prototype.append = function(e)
{
    if (!(e instanceof node)) {
        e = new node(e);
    }
    if (e._parent) {
        _.pull(e._parent.children, e);
    }
    e._parent = this;
    this.children = this.children.concat(e);
}
node.prototype.render = function()
{
    var text = '';

    if (this.open) {
        text += this.open;
    }

    if (this.text) {
        text += this.text;
    }

    for (var i = 0; i < this.children.length; i++) {
        text += this.children[i].render();
    }

    if (this.close) {
        text += this.close;
    }

    return text;
}
node.prototype.parent = function()
{
    return this._parent;
}
var format = exports.format = {

    embed: {
        image: function(src, attributes) {
            this.append('![]('+src+')');
        }
    },

    inline: {
        italic: function($) {
            return ['*', '*'];
        },
        bold: function($) {
            return ['**', '**'];
        },
        link: function($, href) {
            return ['[', ']('+href+')'];
        }
    },

    block: {
        header: function($, header) {
            this.open = '#'.repeat(header)+' '+this.open;
        },
        list: {
            group: function() {
                return new node(['', "\n"])
            },
            line: function($, type, group) {
                if (type == 'ordered') {
                    group.count = group.count || 0;
                    var count = ++group.count;
                    this.open = count+'. '+this.open;
                } else {
                    this.open = '- '+this.open;
                }
            }
        }
    }

};

function convert(ops) {
    var $ = cheerio.load(''), group, line, el, activeInline, beginningOfLine;
    var root = new node();

    function newLine() {
        el = line = new node(["", "\n"]);
        root.append(line);
        activeInline = {};
    }
    newLine();

    for (var i = 0; i < ops.length; i++) {
        var op = ops[i];

        if (_.isObject(op.insert)) {
            for (var k in op.insert) {
                if (format.embed[k]) {
                    applyStyles(op.attributes);
                    format.embed[k].call(el, op.insert[k], op.attributes);
                }
            }
        } else {
            var lines = op.insert.split('\n');

            if (isLinifyable(op.attributes)) {
                // Some line-level styling (ie headings) is applied by inserting a \n
                // with the style; the style applies back to the previous \n.
                // There *should* only be one style in an insert operation.

                for (var j = 1; j < lines.length; j++) {
                    for (var k in op.attributes) {
                        if (format.block[k]) {

                            var fn = format.block[k];
                            if (typeof fn == 'object') {
                                if (group && group.type != k) {
                                    group = null;
                                }
                                if (!group && fn.group) {
                                    group = {
                                        el: fn.group($),
                                        type: k,
                                        value: op.attributes[k],
                                        distance: 0
                                    };
                                    root.append(group.el);
                                }

                                if (group) {
                                    group.el.append(line);
                                    group.distance = 0;
                                }
                                fn = fn.line;
                            }

                            fn.call(line, $, op.attributes[k], group);
                            newLine();
                            break;
                        }
                    }
                }
                beginningOfLine = true;

            } else {
                for (var j = 0; j < lines.length; j++) {
                    if ((j > 0 || beginningOfLine) && group && ++group.distance >= 2) {
                        group = null;
                    }
                    applyStyles(op.attributes, ops[i+1] && ops[i+1].attributes);
                    el.append(lines[j]);
                    if (j < lines.length-1) {
                        newLine();
                    }
                }
                beginningOfLine = false;

            }
        }
    }

    return root;

    function applyStyles(attrs, next) {

        var first = [], then = [];
        attrs = attrs || {};

        var tag = el, seen = {};
        while (tag._format) {
            seen[tag._format] = true;
            if (!attrs[tag._format]) {
                for (var k in seen) {
                    delete activeInline[k];
                }
                el = tag.parent();
            }

            tag = tag.parent();
        }

        for (var k in attrs) {
            if (format.inline[k]) {

                if (activeInline[k]) {
                    if (activeInline[k] != attrs[k]) {
                        // ie when two links abut

                    } else {
                        continue; // do nothing -- we should already be inside this style's tag
                    }
                }
                
                if (next && attrs[k] == next[k]) {
                    first.push(k); // if the next operation has the same style, this should be the outermost tag
                } else {
                    then.push(k);
                }
                activeInline[k] = attrs[k];
            
            }
        }

        first.forEach(apply);
        then.forEach(apply);

        function apply(fmt) {
            var newEl = format.inline[fmt].call(null, $, attrs[fmt]);
            if (_.isArray(newEl)) {
                newEl = new node(newEl);
            }
            newEl._format = fmt;
            el.append(newEl);
            el = newEl;
        }
    }
}

function isLinifyable(attrs) {
    for (var k in attrs) {
        if (format.block[k]) {
            return true;
        }
    }
    return false;
}
