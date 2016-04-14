var _ = require("underscore");

var UserMgr = function(){};

var handler = UserMgr.prototype;

// 默认新建一个用户,给与500金币
var DEFAULT_MONEY = 500;


// ** 此处的增删改选都是同步实现,请在后续版本中实现异步
// 新增用户
handler.add = function(userName,password){
	if(!this.find(userName)){
		var p = {userName:userName,password:password,info:{money:DEFAULT_MONEY}};
		database.push(p);
		return p;
	}
	return false;
};

// 查找用户
handler.find = function(userName){
	return  userName ? _.find(database,function(p){return p.userName == userName;}) : database;
};



// 修改用户
handler.update = function(userName,info){
	var p = this.find(userName);
	if(p){
		p.info = info;
	}
};

// 删除用户
handler.remove = function(userName){
	database = _.filter(database,function(p){return p.userName == userName;});
};

// 虚拟数据库
var database = [
	// 虚拟测试用户
	{userName:"dino",password:"123456",info:{money:1200}},
	{userName:"dino2",password:"123456",info:{money:1000}},
	{userName:"tom",password:"123456",info:{money:1000}},
	{userName:"jack",password:"123456",info:{money:1000}},
	{userName:"lily",password:"123456",info:{money:1000}},
	{userName:"lucy",password:"123456",info:{money:1000}}
];

module.exports = UserMgr;