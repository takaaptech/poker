var _ = require("underscore");

// val重载
// 既可以设置14这样的数字,也可以设置A这样的字母
var Poker = function(val,tag) {
	// 花色值
	this.tag = null;
	// 值;
	// 比如"J"应该是"11"点
	this.val = null;
	// 相当于val的逆运算
	this.str = null;

    this.init(val,tag);
};
// static
Poker.dict = {
	2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,
	11:"J",12:"Q",13:"K",14:"A" 
};
// instance 
var handler = Poker.prototype;
handler.init = function(val,tag){
	this.setTag(tag);
	this.setVal(val);
};

handler.setTag = function(tag){
	this.tag = tag;
};

handler.setVal = function(val){
    if(_.contains(["J","Q","K","A"],val)){
        val = this._convertStrToVal(val);
        this.setVal(val);
    }else{
        this.val = val-0;
        this.str = this._convertValToStr(val);
    }
};

handler._convertValToStr = function(val){
	return Poker.dict[val];
};

handler._convertStrToVal = function(str){
	var val;
	_.find(Poker.dict,function(v,k){
		if(str == v){
			val = k;
			return true;
		}
	});
	return val;
};


module.exports = Poker;
