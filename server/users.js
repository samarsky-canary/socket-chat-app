const users = [];

const getUser = (id) => users.find((user)=> user.id === id);
const getUsersInRomm = (room) => users.filter((user)=> user.room === room);

const removeUser = (id) => {
    const index = users.findIndex((user)=> user.id === id);

    if (index !== -1) return users.splice(index,1)[0];
}

const addUser = ({id, name, room}) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const existingUser = users.find((user)=> user.room === room && user.name == name);
    if (!name || !room) return {error : 'username or room not set'};
    if (existingUser) return {error : 'user already exist'};

    const user = {id, name, room};
    users.push(user);
    return {user};
}

module.exports = {getUser, getUsersInRomm, removeUser, addUser}