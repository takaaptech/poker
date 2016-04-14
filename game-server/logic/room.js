var _ = require("underscore");
var Player = require("./player");
var Poker = require("./poker"),
	rule = require("./rule"),
	combine = require('./combine'),
	judge = require('./judge');

var config = {
	baseBet : 20 
};

var Room = function(name,opts){
	opts = opts || {};

	this.name = name;
	// 最大玩家数量
	this.playerMaxCount = 9;
	this.playerList = [];
	this.playerList.length = this.playerMaxCount;
	/*rest;playing*/
	this.status = "rest";

	/*针对"德州扑克"所特有的,以后需要重构建立继承关系*/
	// 洗牌之后,牌序列
	this.pokerQueue = [];
	// 当前牌序列中的index
	this.pokerIndex = 0;
	// 公牌
	this.pubPokerList = null;
	// 私牌(被combine到了player的属性中)
	// 桌面赌金总额
	this.betSum = 0;
	// 当前回合押注
	this.currBet = 0;
	// 当前"说话"玩家索引
	this.playerIndex = null;
	// 每一个回合开始,第一个说话的playerName
	this.firstPlayerName = null;
	// 基础押注
	this.baseBet = opts.baseBet || config.baseBet;
	// 上一次start的位置
	this.lastStartIndex = -1;
	// 回合数目
	this.roundIndex = 0;

	// 发牌状态
	// hold;flop;turn;river
	this.fetchPokerStatus = null;
};	

// 发牌序列
var fetchQueue = ['hold','flop','turn','river'];

var handler = Room.prototype;

// 初始化
// 开始游戏
handler.startGame = function(){
	this.washPoker();
	this.pubPokerList = [];
	_.each(this.playerList,function(p){
		if(!p){return;}
		p.pokerList = [];
		p.betList = [];
		p.subStatus = "gaming";
		p.role = "normal";
	});

	this.lastStartIndex = this.lastStartIndex == -1 ? 
		this._getNextPlayerIndex(Math.floor(Math.random()*this.playerList.length),function(p){return p;}):
		(this.lastStartIndex + 1)%this.playerList.length;
	this.makeOrder(this.lastStartIndex);

	// 赋值startIndex
	this.playerIndex = this.lastStartIndex;
	// 

	// 赋值发牌的status
	this.fetchPokerStatus = null;


	// 大盲 小盲
	var xiao = _.find(this.playerList,function(p){return p.role == "xiao";});
	var da = _.find(this.playerList,function(p){return p.role == "da";});
	this.firstPlayerName = xiao.name;
	this.playerIndex = _.indexOf(this.playerList,xiao);

	this.betMoney(xiao.name,this.baseBet/2);
	this.betMoney(da.name,this.baseBet);

	// 发私牌
	this.fetchPokerInQueue();
};

handler.addPlayer = function(playerName,opts){
	opts = opts || {};
	var money = opts.money || 100;
	var seatIndex = opts.seatIndex === undefined ? this.getEmptySeatIndex() : opts.seatIndex;
	var player = new Player(playerName,money,seatIndex);
	this.playerList[seatIndex] = player;
};

// 找到一个空位置
handler.getEmptySeatIndex = function(){
	for(var i=0;i<this.playerList.length;i++ ){
		var pi = this.playerList[i];
		if(pi === undefined || pi === null){
			return i;
		}
	}
	return -1;
};

handler.removePlayer = function(playerName){
	var index = _.findIndex(this.playerList,function(p){
		return p && p.name == playerName;
	});
	this.playerList[index] = null;

};


// 切换当前"说话"玩家
handler.switchRound = function(){
	if(this.isRoundOver()){
		this.playerIndex = _.findIndex(this.playerList,function(p){return p.name  == this.firstPlayerName;}.bind(this));
	}else{
		while(1){
			this.playerIndex = (this.playerIndex+1)%this.playerList.length;
			var p = this.playerList[this.playerIndex];
			if(p && p.subStatus == "gaming"){
				break;
			}
		}
	}
};

// 获取当前玩家
handler.getCurrPlayer = function(){
	return this.playerList[this.playerIndex];
};

// 寻找玩家
handler.getPlayerByName = function(playerName){
	return _.find(this.playerList,function(p){return p.name == playerName;});
};



// 是否当前回合可以结束(来发下一轮牌 或则 判断比赛)
// 所有玩家达到当前bet数目 或则 有玩家放弃比赛
handler.isRoundOver = function(){
	// 所有没有fold的玩家
	var unFoldList = this._getUnfoldList();
	// 所有玩家的押金都一致
	var group = _.groupBy(unFoldList,function(p){return [p.betList.length,p.betList[p.betList.length-1]].join('#');});
	if(_.size(group) === 1){
		return true;
	};
	// 所有玩家的金额都已经为0
	if(_.all(unFoldList,function(p){return p.money == 0; })){
		return true;
	};
	return false;
};

// 获取当前回合bet值
// 即获取当前各个玩家bet最大值
handler.getCurrBet = function(){
	return this.currBet;
};

// 获取当前bet金额的资金池
// 资金池包括主池和各个边池
/*
	[
		{
			playerNameList:[],
			betSum:Number
		}
	]
*/
handler.getBetPool = function(){
	var sum = function(player){
		return _.reduce(player.betList,function(memo,b){return memo+b},0);
	};
	var unFoldList = this._getUnfoldList();
	var playerList = this._getValidList();
	var foldBetSum= _.reduce(playerList,function(memo,p){
		if(p.subStatus == 'fold'){
			memo +=  sum(p);
		};
		return memo;
	},0);

	// 非弃牌玩家押注列表,升序
	var betList = _.map(unFoldList,function(p){
		return {playerName:p.name,betSum:sum(p)};
	}).sort(function(a,b){return a.betSum - b.betSum;});

	var rst = [];
	_.each(betList,function(b,i){
		if(b.betSum == 0) {return;}

		var lastBetList = betList.slice(i+1);
		_.each(lastBetList,function  (bb) {
			bb.betSum -= b.betSum;
		});
		var playerNameList = _.map(betList.slice(i),function(b){return b.playerName;});
		var betSum = b.betSum * (betList.length - i);
		// 弃牌的奖金要被加入主池中
		if(i==0){
			betSum += foldBetSum;
		}
		rst.push({playerNameList:playerNameList,betSum:betSum});
	});
	return rst;
};


// 裁判
handler.judge = function(){
	var playerList = this._getValidList();
	var rstList = _.map(playerList,function(p){
		var rst = this.judgeSinglePlayer(p.name);
		rst.playerName = p.name;
		return rst;
	}.bind(this));

	rstList.sort(function(ra,rb){
		return judge(ra.rule,rb.rule) == -1 ?1 : 0;
	});

	var arr = [];
	var ai,lastRule;
	_.each(rstList,function(r){
		if(!lastRule || judge(r.rule,lastRule) != 0){
			ai = [];
			arr.push(ai);
			ai.push(r);
			lastRule = r.rule;
		} else {
			ai.push(r);
		}
	});

	return arr;	
};

// 裁判某个玩家
handler.judgeSinglePlayer = function(playerName){
	var p = this.getPlayerByName(playerName);
	return this.judgeSingle(this.pubPokerList,p.pokerList);
};


// 
/*
	{
		pokerList:[]
		rule:[[],[]]
	}
*/
handler.judgeSingle = function(pubPokerList,priPokerList){
	var arr = combine(pubPokerList,3);
	arr = _.map(arr,function(ai){
		var pokerList = ai.concat(priPokerList); 
		var r = rule(pokerList);
		return {
			rule:r,
			pokerList:pokerList
		};
	});
	arr = arr.sort(function(a,b){
		var ra = a.rule
		var rb = b.rule;
		return judge(ra,rb) == -1?1:0;
	});
	return arr[0];
};


// 洗牌
handler.washPoker = function(){
	if(this.pokerQueue.length == 0){
		// 生成所有的牌
		for (var i = 2; i <= 14; i++) {
			for(var j = 0; j<=3; j++){
				var po = new Poker(i,j);
				this.pokerQueue.push(po);
			}
		};
	}
	// 打乱顺序
	this.pokerQueue = this.pokerQueue.sort(function(){return Math.random()-Math.random();});
};

// 发牌
// count 发牌数量
handler.getPoker = function(count){
	var pokerList = this.pokerQueue.slice(this.pokerIndex,this.pokerIndex+count);
	this.pokerIndex += count;
	return pokerList;
};

handler.makeOrder = function(index/*特别指定庄家index*/){
	_.each(this.playerList,function(p){
		if(p){
			p.role = 'normal';
		}
	});
	// console.log(index)
	// var obj = this.playerList;
	// console.log(JSON.stringify(obj,undefined,4));
	// console.log(JSON.stringify(obj,undefined,4));

	this.playerList[index].role = 'start';
	index = this._getNextPlayerIndex(index,function(p){return p;});
	this.playerList[index].role = 'xiao';
	index = this._getNextPlayerIndex(index,function(p){return p;});
	this.playerList[index].role = 'da';


};

handler._getNextPlayerIndex = function(index,predicate){
	var nextIndex = -1;
	var p = null;
	var count = 0;
	while(1){
		index++;
		index = index % this.playerList.length;
		p = this.playerList[index];
		if(predicate(p)){
			nextIndex = index;
			break;
		}
		if(count == this.playerList.length){
			break;
		}
	}
	return nextIndex;
};

// 获取某位玩家的私牌
handler.getPokerListByPlayerName = function(playerName){
	var p = this.getPlayerByName(playerName);
	return p.pokerList;
};

// 通用发牌
// playerName为空,则意味着是公牌
handler.fetchPoker = function(playerName,pokerList){
	if(playerName){
		var p = this.getPlayerByName(playerName);
		p.pokerList = p.pokerList.concat(pokerList);
	}else{
		this.pubPokerList = this.pubPokerList.concat(pokerList);
	}
};

// 按照序列发牌
// 自动调用
handler.fetchPokerInQueue = function(){
	var index = -1;
	if(this.fetchPokerStatus === null){
		index = 0 ;
	}else{
		index = _.indexOf(fetchQueue,this.fetchPokerStatus)+1;
	}
	this.fetchPokerStatus = fetchQueue[index];
	this[this.fetchPokerStatus]();
};

// 返回发牌状态
handler.getFetchPokerStatus = function(){
	return this.fetchPokerStatus;
};

// 是否发牌结束
handler.isFetchPokerOver = function(){
	return this.fetchPokerStatus == 'river';
};

// 发玩家底牌
handler.hold = function(){
	var self = this;
	var count = 2; /*底牌数量是2张*/
	var playerList = this._getUnfoldList();
	_.each(playerList,function(p){
		var pokerList = self.getPoker(count);
		self.fetchPoker(p.name,pokerList);
	});
};

// flop,发三张公牌
handler.flop = function(){
	var count = 3;
	var pokerList = this.getPoker(count);
	// console.log("flop");
	// console.log(pokerList);
	this.fetchPoker(null,pokerList);
};

// turn,发一张公牌(第四张公牌)
handler.turn = function(){
	var count = 1;
	var pokerList = this.getPoker(count)
	this.fetchPoker(null,pokerList);
};

// river,发一张公牌(第五张公牌)
handler.river = function(){
	var count = 1;
	var pokerList = this.getPoker(count)
	this.fetchPoker(null,pokerList);
};


// 玩家Action
// 把玩家Action写在此处,是因为将player类纯粹作为实体类来处理
// ** 不传入playerName,因为应该必定是当前玩家

// 下注
handler.bet = function(money){
	this.betMoney(this.getCurrPlayer().name,money);
};

// 不加注
handler.check = function(){

};

// 随注
handler.call = function(){
	var money = this.getCurrBet();
	var p = this.getCurrPlayer();
	var lastBet = p.betList[this.roundIndex] || 0;
	this.betMoney(this.getCurrPlayer().name,money-lastBet);
};

// 提高加注
handler.raise = function(money){
	this.betMoney(this.getCurrPlayer().name,money);
};

// 全压
handler.allIn = function(){
	var p = this.getCurrPlayer();
	this.betMoney(p.name,p.money);
};

// common方法
handler.betMoney = function(playerName,money){
	var currBet = this.getCurrBet();
	var p = this.getPlayerByName(playerName);
	if(currBet > p.betList[p.betList.length-1] + money){
		throw "betMoney is lower than currBet!";
	}
	if(money > p.money){
		throw "player dont have enough money";
	}
	p.betList[this.roundIndex] = p.betList[this.roundIndex] || 0;
	p.betList[this.roundIndex] += money;
	p.money -= money;
	// 重新设置当前押注
	this.currBet = Math.max(this.currBet,p.betList[this.roundIndex]);
	// 切换到下一个玩家
	if(!this.isRoundOver()){
		this.switchRound();
	}else{
		// todo
		// 是否发牌结束
		if(this.isFetchPokerOver()){
			this.judge();
		}else{
			this.roundIndex++;
			// 按照发牌顺序发牌
			this.fetchPokerInQueue();
			this.switchRound();

		}
		// 发牌

	}
};

// 退出
handler.fold = function(playerName){
	var p = this.getPlayerByName(playerName);
	p.subStatus = "fold";


	// 如果第一说话玩家fold,则需要让下一个"非fold"玩家成为第一说话玩家
	if(p.playerName == this.firstPlayerName){
		var firstPlayerIndex = _.indexOf(this.playerList,function(p){return p.name == this.firstPlayerName;}.bind(this));
		while(1){
			firstPlayerIndex = (firstPlayerIndex+1)%this.playerList.length;
			var firstPlayer = this.playerList[firstPlayerIndex];
			if(firstPlayer && firstPlayer.subStatus == "gaming"){
				this.firstPlayerName = this.playerList[this.firstPlayerIndex].name;
				break;
			}
		}
	}
	this.switchRound();
};

// 获取所有尚未弃牌的玩家
handler._getUnfoldList = function(){
	var list = this._getValidList();
	return _.filter(list,function(p){return p.subStatus != "fold";});
};

// 获取所有合法玩家(坐在座位上的,包括"弃牌"和"非弃牌"的)
handler._getValidList = function(){
	return _.filter(this.playerList,function(p){return p;});
};

module.exports = Room;