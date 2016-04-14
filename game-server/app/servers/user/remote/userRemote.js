var _ = require('underscore');
var UserMgr = require("../../../../logic/userMgr");

module.exports = function(app) {
	return new UserRemote(app);
};

var UserRemote = function(app) {
	this.app = app;
	this.userMgr = new UserMgr();
	// var channelService = app.get('channelService');
	// this.channel = channelService.getChannel("userList",true);
};

var handler = UserRemote.prototype;

handler.add = function(userName) {
	this.userMgr.add(userName);
};

handler.remove = function(userName){
	this.userMgr.remove(userName);
};

handler.getMember = function(userName,next){
	var member = this.userMgr.find(userName);
	next(member);
};
