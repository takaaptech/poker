module.exports = function(app) {
  return new Hall(app);
};

var Hall = function(app) {
  this.app = app;
};

var handler = Hall.prototype;



// 获取所有的房间
handler.getRoomList = function(msg,session,next){
	var self = this;
	self.app.rpc.hall.hallRemote.getRoomList(session,function(roomList){
		next(null,{roomList:roomList});
	});
};

// 进入房间
handler.enterRoom = function(msg, session, next) {
	var self = this;
	var roomName = msg.roomName;
	var playerName = session.uid;
	var sid = session.get("sid");
	self.app.rpc.user.userRemote.getMember(session,playerName,function(member){
		var player = member;
		console.log("****");
		console.log(player);
		var playerName = player.userName,
			money = player.info.money;
		console.log("******");
		self.app.rpc.hall.hallRemote.enterRoom(session,roomName,playerName,money,sid,function(roomInfo){
			console.log("handler.enterRoom ->");
			console.log(JSON.stringify(roomInfo,undefined,4));
			next(null,{roomInfo:roomInfo});
		});
	});
};

handler.createRoom = function(msg,session,next){
	var self = this;
	var roomName = msg.roomName;
	self.app.rpc.hall.hallRemote.createRoom(session,roomName,function(roomInfo){
		next(null,{roomInfo:roomInfo});
	});
};


handler.test = function(msg,session,next){
	var self = this;
	console.log(msg);
	var sid = self.app.get("serverId");
	console.log("hall serverId -> " + sid);
	var frontSid = session.get("sid");
	console.log("hall frontSid -> " + frontSid);
	next(null,{code:0,msg:"hello from hall"});
};