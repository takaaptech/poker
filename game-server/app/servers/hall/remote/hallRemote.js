var _ = require("underscore");

var Hall = require("../../../../logic/Hall"); 
var Room = require("../../../../logic/Room"); 

module.exports = function(app) {
	return new HallRemote(app);
};

// 默认房间个数
var ROOM_COUNT = 50;

var HallRemote = function(app){
	this.app = app;
	this.createDefault();	
};

var handler = HallRemote.prototype;

// 建立默认大厅和默认房间
handler.createDefault = function(){
	this.hall = new Hall('hall0');
};

// 进入大厅
handler.enterHall =  function(playerName,serverId,next){
	this.hall.enterHall(playerName);
	next();
};

handler.quitHall =function(playerName,serverId,next) {
	var self = this;
	self.hall.quitHall(playerName);

	// 
	var room = self.hall.findRoomByPlayeName(playerName);
	if(room){
		// 退出通信通道
		var channelService = self.app.get("channelService");
		var channel = channelService.getChannel(room.name);
		channel.leave(playerName,serverId);
	}
	next();

};

// 退出大厅

// 获取房间列表
handler.getRoomList = function(next){
	var roomList = _.map(this.hall.roomList ,function(r){
		return {
			roomName:r.name,
			playerCount:r.playerList.length,
			status:r.status
		};
	});
	next(roomList);
};

// 创建房间
handler.createRoom = function(roomName,next){
	var self = this;
	var room = self.hall.createRoom(roomName);
	var info = getRoomInfo(room);

	// 建立通信通道
	var channelService = self.app.get("channelService");
	channelService.createChannel(roomName);
	
	next(info);
};

// 删除房间
handler.removeRoom = function(roomName,next) {
	var self = this;
	var room = self.hall.removeRoom(roomName);
	var info = getRoomInfo(room);

	// 删除通信通道
	var channelService = self.app.get("channelService");
	channelService.destroyChannel(room.name);

	next(info);
};

// 进入房间
handler.enterRoom = function(roomName,playerName,money,serverId,next) {
	var self = this;
	self.hall.enterRoom(roomName,playerName,money);

	var room = self.hall.findRoom(roomName);
	var info = getRoomInfo(room);

	// 通道信息
	var channelService = self.app.get("channelService");
	var channel = channelService.getChannel(roomName);
	channel.add(playerName,serverId);
	var msg = {
		route:"refreshPlayerListInRoom",
		roomInfo:info
	};
	channel.pushMessage(msg);

	next(info);


	
};

// 退出房间
handler.quitRoom = function(roomName,playerName,serverId,next){
	var self = this;
	self.hall.quitRoom(roomName,playerName);
	
	// 退出通信通道
	var channelService = self.app.get("channelService");
	var channel = channelService.getChannel(roomName);
	channel.leave(playerName,serverId);
	
	var room = self.hall.findRoom(roomName);
	var info = getRoomInfo(room);
	var msg = {
		route:"refreshPlayerListInRoom",
		roomInfo:info
	};
	channel.pushMessage(msg);

	next();
};


// 格式化room信息
function getRoomInfo(room){
	var getSimplePlayer = function(player){
		return {
			name:player.name,
			money:player.money
		};
	};
	return {
		roomName:room.name,
		playerList:_.map(room.playerList,getSimplePlayer),
		status:room.status
	};
};
