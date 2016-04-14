var _ = require("underscore");
var Room = require("../logic/room");
var Poker = require("../logic/poker");

var toString = require("./toString");

describe("test-room",function(){
	console.log("test-room.js");

	var room;
	beforeEach(function(){
		room = new Room("room0");
	});

	// 增删玩家
	it("addPlayer && removePlayer",function(){
		room.addPlayer("dino");
		var getValidPlayerList = function(list){return _.filter(list,function(p){return p;});};
		expect(getValidPlayerList(room.playerList).length).toBe(1);
		expect()

		room.removePlayer("dino");
		expect(getValidPlayerList(room.playerList).length).toBe(0);
	});

	// 确定'庄家','大盲','小盲'
	it("makeOrder",function(){
		room.addPlayer("dino1");
		room.addPlayer("dino2");
		room.addPlayer("dino3");
		room.addPlayer("dino4");


		room.startGame();
		room.makeOrder(2);

		var playerList = room.playerList;
		var len = playerList.length;

		var start = getPlayerByRole(playerList,'start'),
			xiao = getPlayerByRole(playerList,'xiao'),
			da = getPlayerByRole(playerList,'da');

		// toString(playerList);
		// toString(start);

		expect(start.name).toBe('dino3');
		expect(xiao.name).toBe('dino4');
		expect(da.name).toBe('dino1');


	});

	it("washPoker && getPoker",function(){
		var room1 = new Room("room1");

		room.washPoker();
		room1.washPoker();

		var count = 5;
		var pokerList0 = room.getPoker(count);
		var pokerList1 = room1.getPoker(count);

		// 因为抽走了count张牌
		expect(room.pokerIndex).toBe(count);

		// 洗牌之后,牌是随机的
		var flag = false;
		for (var i = 0; i < count; i++) {
			if(pokerList0[i].val != pokerList1[i].val){
		 		flag = true;
				break;
			}
		};

		expect(flag).toBe(true);
	});

});

describe("mock game",function(){
	var room;
	var jack, tom, lily, lucy;
	var baseBet = 20;
	var baseMoney = 2000;
	// data格式
	/*
		'10-0|J-1|K|A'
	*/
	var mockPoker = function(room,data){
		room.pokerQueue = parsePoker(data);
	};

	var parsePoker = function(data){
		var list = data.split('|');
		var pokerList = _.map(list,function(n){
			var arr = n.split('-');
			var po = new Poker(arr[0],arr[1]||0);
			return po;
		});
		return	pokerList;
	};

	var mapPokerWithValue = function(pokerList){
		pokerList.sort(function(pa,pb){
			return pb.val - pa.val;
		});
		var strList =  _.map(pokerList,function(po) {
			return po.str;
		}).join(",");
		return strList;
	};

	beforeEach(function(){
		room = new Room("room0",{baseBet:baseBet});
		room.addPlayer("tom",{money:baseMoney});
		room.addPlayer("jack",{money:baseMoney});
		room.addPlayer("lily",{money:baseMoney});
		room.addPlayer("lucy",{money:baseMoney});

		jack = room.getPlayerByName('jack'),
		tom = room.getPlayerByName('tom'),
		lily = room.getPlayerByName('lily'),
		lucy = room.getPlayerByName('lucy');
	});

	// 比牌
	it("judge-1",function(){
		room.pubPokerList = parsePoker('10-0|10-1|8|8-1|8-2')
		tom.pokerList = parsePoker('10-2|9-1');
		jack.pokerList = parsePoker('8-3|10-3');
		lily.pokerList = parsePoker('A|A-1');
		lucy.pokerList = parsePoker('K|K-1');

		var p =  room.judgeSingle(room.pubPokerList,tom.pokerList);
		var strList = mapPokerWithValue(p.pokerList);
		expect(strList).toBe('10,10,10,9,8');

		p = room.judgeSinglePlayer('jack');
		strList = mapPokerWithValue(p.pokerList);
		expect(strList).toBe('10,8,8,8,8');

		var rst = room.judge();
		expect(rst[0][0].playerName).toBe('jack');
		expect(rst[3][0].playerName).toBe('tom');

		// toString(_.map(rst,function(r){
		// 	return {
		// 		playerName : r.playerName,
		// 		str: mapPokerWithValue( r.pokerList)
		// 	};
		// }));
	});

	it("judge-2",function(){
		room.pubPokerList = parsePoker('10-0|10-1|7|8-1|9-2')
		tom.pokerList = parsePoker('10-2|7-1');
		jack.pokerList = parsePoker('10-3|7-3');
		lily.pokerList = parsePoker('A|A-1');
		lucy.pokerList = parsePoker('K|K-1');


		var rst = room.judge();
		var firstRow = _.map(rst[0],function(n){return n.playerName;}).sort().join(",");
		expect(firstRow).toBe('jack,tom');
	});

	// 奖金池
	it("betPool",function() {
		var format = function(pool){
			return _.map(pool,function(po){
				return {
					playerNameList : po.playerNameList.sort().join(","),
					betSum : po.betSum
				};
			});
		};

		tom.betList = [100,200,500];
		tom.subStatus = 'gaming';
		jack.betList = [100,200];
		jack.subStatus = 'fold';
		lily.betList = [100,200,1000];
		lily.subStatus = 'gaming';
		lucy.betList = [100,200,2000];
		lucy.subStatus = 'gaming';

		var exp = [
			{
				playerNameList:["tom","lily","lucy"],
				betSum : 2700 // 800*3+300
			},
			{
				playerNameList:["lily","lucy"],
				betSum : 1000
			},
			{
				playerNameList:["lucy"],
				betSum : 1000
			}
		];
		var formatRst = format(room.getBetPool());
		expect(formatRst).toEqual(format(exp));
		// toString(formatRst);

		tom.betList = [100,200,500];
		tom.subStatus = 'gaming';
		jack.betList = [100,200];
		jack.subStatus = 'fold';
		lily.betList = [100,200,500];
		lily.subStatus = 'gaming';
		lucy.betList = [100,200,2000];
		lucy.subStatus = 'gaming';

		var exp = [
			{
				playerNameList:["tom","lily","lucy"],
				betSum : 2700 // 800*3+300
			},
			{
				playerNameList:["lucy"],
				betSum : 1500
			}
		];
		var formatRst = format(room.getBetPool());
		expect(formatRst).toEqual(format(exp));
		// toString(formatRst);



	});

	
	it("game0",function(){
		// return;
		/*
			1. tom call
			2. jack raise 100
			3. lily raise 200
			4. lucy fold
			5. tom call
			6. jack call
			8. * fetch poker *
			9. lily raise 500
			10. tom fold
			11. jack call
			12 * fetch poker *
			13. lily allIn
			14. jack allIn
			15 * fetch poker *
			16 * judge *
		*/


		room.lastStartIndex = 0;
		// jack start;

		room.startGame();		

		expect(room.firstPlayerName).toBe("lily");

		var start = getPlayerByRole(room.playerList,'start');
		var xiao = getPlayerByRole(room.playerList,'xiao');
		var da = getPlayerByRole(room.playerList,'da');



		expect(room.getCurrBet()).toBe(baseBet);
		// var data = '';
		// mockPoker(room,data);

		// toString(room.playerIndex);
		// toString(xiao);
		// toString(da);

		expect(xiao.money).toBe(baseMoney - baseBet/2);
		expect(xiao.betList[0]).toBe(baseBet/2);
		expect(da.money).toBe(baseMoney - baseBet);
		expect(da.betList[0]).toBe(baseBet);

		expect(room.getFetchPokerStatus()).toBe('hold');

		// toString(room.playerIndex);
		// 轮到tom来下
		expect(room.getCurrPlayer().name).toBe('tom');
		// 1. tom call
		room.call();
		expect(tom.money).toBe(1980);
		expect(tom.betList[0]).toBe(20);
		expect(room.isRoundOver()).toBe(false);

		// 2. jack raise 100
		room.raise(100);
		expect(jack.money).toBe(1900);
		expect(jack.betList[0]).toBe(100);

		// 3. lily raise 200
		room.raise(200);
		expect(lily.betList[0]).toBe(10+200);
		
		// 4. lucy fold
		room.fold('lucy');
		expect(lucy.subStatus).toBe('fold');
		expect(room.getCurrPlayer().name).toBe('tom');

		// 5. tom call
		room.call();
		expect(tom.betList[0]).toBe(210);

		// 6. jack call
		room.call();
		expect(jack.betList[0]).toBe(210);
		expect(room.isRoundOver()).toBe(true);

		// 8. * fetch poker *
		// 发放3张公牌
		// toString(room.pubPokerList);
		expect(room.getFetchPokerStatus()).toBe('flop');
		expect(room.pubPokerList.length).toBe(3);

		// 9. lily raise 500
		room.raise(500);
		expect(lily.betList[1]).toBe(500);
		expect(room.getCurrBet()).toBe(500);

		// 10. tom fold
		room.fold("tom");
		expect(room._getUnfoldList().length).toBe(2);

		// 11. jack call
		room.call();
		expect(jack.betList[1]).toBe(500);
		expect(room.isRoundOver()).toBe(true);
		// toString(room.playerList);

		return;
		// 12 * fetch poker *
		expect(room.getFetchPokerStatus()).toBe("turn");

		// 13. lily allIn----
		expect(room.getCurrPlayer().name).toBe("lily");
		room.allIn();
		expect(lily.money).toBe(0);
		expect(room.getCurrBet()).toBe(1300);

		// 14. jack allIn
		expect(room.getCurrPlayer().name).toBe("jack");
		room.allIn();
		expect(jack.money).toBe(0);
		expect(room.getCurrBet()).toBe(1300);
		

		// 15 * fetch poker *
		expect(room.getFetchPokerStatus()).toBe("river");
		
		// 16 * judge *
	});




});

function getPlayerByRole(playerList,role){
	return _.find(playerList,function(p){return p.role == role;});
};

