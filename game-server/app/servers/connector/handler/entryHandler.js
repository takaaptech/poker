module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

// 登陆
Handler.prototype.entry = function(msg, session, next) {
	var self = this;
	var userName = msg.userName,
		password = msg.password;

	var sid = self.app.get("serverId");
	console.log("front serverId -> " + sid);
	
	session.bind(userName);
	session.set("sid",sid);
	session.push("sid");
	var _session = session;
	self.app.rpc.user.userRemote.getMember(session,userName,function(member){
		var p = member;
		console.debug(JSON.stringify(p,undefined,4));
		if(p && p.password == password){
			var sessionService = self.app.get("sessionService");
			if(sessionService.getByUid(userName)){
				next(null,{msg:'duplicate login'});
			}else{
				var sid = self.app.get('serverId');
				self.app.rpc.hall.hallRemote.enterHall(session,userName,sid,function(){
					console.log("enter hall");
				});
				session.on('closed',function(app,session){
					onUserLeave(app,session,userName);
				});
				next(null,{user:p});
			}
		}else{
			next(null,{msg:'no such user OR password not correct'});
		}
	});
};

var onUserLeave = function(app,session,userName){
	if(session){
		console.log("onUserLeave");
		var sid = app.get('serverId');
		self.app.rpc.hall.hallRemote.quitHall(session,userName,sid,function(){
			console.log("quit hall");
		});
	}
};

var onUserEnter = function(next,err,msg){
	next(null,msg);
};
