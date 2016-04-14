var _ = require("underscore");
var Room = require("./room");

var Hall = function(name){
	this.name = name;
	this.roomList = [];
	this.playerList = [];
};

var handler = Hall.prototype;


// 创建房间
handler.createRoom = function(roomName){
	var room = new Room(roomName);
	this.roomList.push(room);
	return room;
};
// 删除房间
handler.removeRoom=function(roomName){
	this.roomList = _.filter(this.roomList,function(r){return r.name != roomName;});
};
// 进入房间
handler.enterRoom=function(roomName,playerName,money){
	var room = this.findRoom(roomName);
	if(room){
		room.addPlayer(playerName,money);
	};
};

// 查找房间 BY 房间名
handler.findRoom = function(roomName){
	return _.find(this.roomList,function(r){return r.name == roomName;});
};

// 查找房间 BY 玩家名
handler.findRoomByPlayerName = function(playerName){
	return _.find(this.roomList,function(r){return _.find(r.playerList,function(p){return p.name == playerName;})});
};



// 退出房间
handler.quitRoom=function(roomName,playerName){
	var room = _.find(this.roomList,function(r){return r.name == roomName;});
	if(room){
		room.removePlayer(playerName);
	}
};

// 进入大厅
handler.enterHall=function(playerName){
	this.playerList.push(playerName);
};
// 退出大厅 
handler.quitHall=function(playerName){
	this.playerList = _.filter(this.playerList,function(p){
		return p.name != playerName;
	});

	// 如果在房间,则要从房间退出
	var room = this.findRoomByPlayerName(playerName);
	if(room){
		room.removePlayer(playerName);
	}
	
};


module.exports = Hall;