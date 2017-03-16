'use strict';

module.exports = {
  add: add,
  update: update,
  get_all: get_all,
  reset: reset,
  set_items: set_items,
  get: get
};

var items = [];

function add(item) {
  var i = items.length;
  item.id = (i+1).toString();
  items[i] = item;
  return item;
}

function get(id) {
  return items[Number(id)-1];
}

function update(item) {
  items[Number(item.id)-1] = item;
}

function get_all() {
  return items;
}

function reset() {
  items = [];
}

function set_items(new_items) {
  items = new_items;
}
