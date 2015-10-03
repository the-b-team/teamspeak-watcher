// convert raw data from TeamSpeak ServerQuery output and convert it in to an array of objects
module.exports = function(data) {
    var users = data.split('|'); // ServerQuery separates each user with the pipe character
    var userObjs = [];
    users.forEach(function(user) { // for each user
        var userToAdd = objectifyUser(user);
        if (userToAdd.client_type === '0') userObjs.push(objectifyUser(user)); // add returned user object to array to be returned (if it's a normal user (i.e. not serverquery user))
    });
    return userObjs;
};

// ServerQuery provides a space separated list of key=value pairs
var objectifyUser = function(user) {
    var userInfo = user.split(' '); // split at the space character to separate each key=value pair
    var userObj = {}
    userInfo.forEach(function(info) { // for each key=value pair
        var infoArr = info.split('='); // separate each key=value item
        userObj[infoArr[0]] = infoArr[1].replace(/\\s/g, ' '); // add resulting keys and values to object
    });
    return userObj;
};
