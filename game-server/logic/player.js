var _ = require("underscore");

var Player = function(name,money,seatIndex){
	this.name = name;
	this.money = money;
	this.seatIndex = seatIndex;
	/*notReady,ready*/
	this.status = "notReady"; 
	/*normal - 普通,
	start - 庄家,起始点,
	da - 大盲,
	xiao - 小盲*/
	this.role = "normal";
	// 私牌
	this.pokerList = [];
	// 押金
	this.betList = [];
	// 游戏状态
	/*gaming,fold*/
	this.subStatus = "gaming";
};


module.exports = Player;
