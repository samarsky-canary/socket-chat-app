"use strict";

var users = [];

var getUser = function getUser(id) {
  return users.find(function (user) {
    return user.id === id;
  });
};

var getUsersInRomm = function getUsersInRomm(room) {
  return users.filter(function (user) {
    return user.room === room;
  });
};

var removeUser = function removeUser(id) {
  var index = users.findIndex(function (user) {
    return user.id === id;
  });
  if (index !== -1) return users.splice(index, 1)[0];
};

var addUser = function addUser(_ref) {
  var id = _ref.id,
      name = _ref.name,
      room = _ref.room;
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();
  var existingUser = users.find(function (user) {
    return user.room === room && user.name == name;
  });
  if (!name || !room) return {
    error: 'username or room not set'
  };
  if (existingUser) return {
    error: 'user already exist'
  };
  var user = {
    id: id,
    name: name,
    room: room
  };
  users.push(user);
  return {
    user: user
  };
};

module.exports = {
  getUser: getUser,
  getUsersInRomm: getUsersInRomm,
  removeUser: removeUser,
  addUser: addUser
};