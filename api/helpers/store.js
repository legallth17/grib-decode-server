'use strict';

module.exports = {
  add: add,
  update: update,
  get_all: get_all,
  reset: reset,
  set_items: set_items
};

var items = [];

function add(item) {
  var i = items.length;
  item.id = (i+1).toString();
  items[i] = item;
  return item;
}

function get_all() {
  return items;
}

function update(item) {
  items[item.id] = item;
}

function reset() {
  items = [];
}

function set_items(new_items) {
  items = new_items;
}
