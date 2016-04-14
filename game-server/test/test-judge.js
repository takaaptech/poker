var _ = require("underscore");
var rule = require("../logic/rule");
var Poker = require("../logic/poker");
var judge = require("../logic/judge");

console.log("test-judge.js");


describe("poker judge",function(){
	var rstDict;
	beforeEach(function(){
		rstDict = {};
	});

	// poker主类型的比较
	it("judge mainType",function(){
		rstDict["royalFlush"] = makeRule('A|K|Q|J|10');
		rstDict["fourKind"] = makeRule('A-0|A-1|A-2|A-3|5');
		rstDict["fullHouse"] = makeRule('A-0|A-1|A-2|K-0|K-1');
		rstDict["flush"] = makeRule('A|K|Q|J|5');
		rstDict["straight"] = makeRule('A|K|Q|J|10-1');
		rstDict["threeKind"] = makeRule('A-0|A-1|A-2|K|Q');
		rstDict["twoPair"] = makeRule('A-0|A-1|k-2|K-0|5');
		rstDict["onePair"] = makeRule('A-0|A-1|5|6|7');
		rstDict["hightCard"] = makeRule('5|6|7|8|K-1');

		var flag = true;
		var arr = [];
		arr.push("royalFlush,fourKind");
		arr.push("fourKind,fullHouse");
		arr.push("fullHouse,flush");
		arr.push("flush,straight");
		arr.push("straight,threeKind");
		arr.push("threeKind,twoPair");
		arr.push("twoPair,onePair");
		arr.push("onePair,hightCard");

		_.each(arr,function(n,i){
			var arr = n.split(",");
			var rst = judge(rstDict[arr[0]],rstDict[arr[1]]);
			if(rst != 1){
				console.log(n);
				console.log(rst);
				toString(rstDict[arr[0]]);
				toString(rstDict[arr[1]]);

			}
			flag = flag && (rst == 1);
		});
		expect(flag).toBe(true);
	});

	// poker次级比较(主类型一致)
	it("judge subScore",function  () {
		// fourKind
		// 大牌一样,就比较单牌大小
		rstDict["fourKind1"] = makeRule('A-0|A-1|A-2|A-3|5');
		rstDict["fourKind2"] = makeRule('A-0|A-1|A-2|A-3|4');
		expect(judge(rstDict["fourKind1"],rstDict["fourKind2"])).toBe(1);

		// 大牌优先
		rstDict["fourKind1"] = makeRule('A-0|A-1|A-2|A-3|5');
		rstDict["fourKind2"] = makeRule('K-0|K-1|K-2|K-3|7');
		expect(judge(rstDict["fourKind1"],rstDict["fourKind2"])).toBe(1);

		// 大牌一样,单排大小不比较花色
		rstDict["fourKind1"] = makeRule('K-0|K-1|K-2|K-3|5-0');
		rstDict["fourKind2"] = makeRule('K-0|K-1|K-2|K-3|5-1');
		expect(judge(rstDict["fourKind1"],rstDict["fourKind2"])).toBe(0);

		// twoPair
		rstDict["twoPair1"] = makeRule('A-0|A-1|K-2|K-3|5');
		rstDict["twoPair2"] = makeRule('A-0|A-1|K-2|K-3|Q');
		// toString(rstDict["twoPair1"]);
		// toString(rstDict["twoPair2"]);
		expect(judge(rstDict["twoPair1"],rstDict["twoPair2"])).toBe(-1);

		rstDict["twoPair1"] = makeRule('A-0|A-1|K-2|K-3|Q');
		rstDict["twoPair2"] = makeRule('A-0|A-1|K-2|K-3|J');
		expect(judge(rstDict["twoPair1"],rstDict["twoPair2"])).toBe(1);

		rstDict["twoPair1"] = makeRule('A-0|A-1|K-2|K-3|Q-0');
		rstDict["twoPair2"] = makeRule('A-0|A-1|K-2|K-3|Q-1');
		expect(judge(rstDict["highCard1"],rstDict["highCard2"])).toBe(0);
		
		// highCard
		rstDict["highCard1"] = makeRule('A-0|Q-1|J-2|10-3|6-0');
		rstDict["highCard2"] = makeRule('A-0|Q-1|J-2|10-3|5-0');
		expect(judge(rstDict["highCard1"],rstDict["highCard2"])).toBe(1);

		rstDict["highCard1"] = makeRule('A-0|Q-1|J-2|10-3|6-0');
		rstDict["highCard2"] = makeRule('A-0|Q-1|J-2|9-3|6-0');
		expect(judge(rstDict["highCard1"],rstDict["highCard2"])).toBe(1);


	});
});




function makePoker(str){
	var arr = str.split("-");
	return new Poker(arr[0],arr[1]||0);
};

function makePokerList(str){
	var arr = str.split("|");
	return _.map(arr,makePoker);
};

function makeRule(str){
	return rule(makePokerList(str));
};



function toString(obj){
	console.log(JSON.stringify(obj,undefined,4));
};