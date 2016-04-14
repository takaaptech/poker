var _ = require("underscore");
var rule = require("../logic/rule");
var Poker = require("../logic/poker");

console.log("test-rule.js");

var pokerList,rst;
var rstDict = {};

var map = function(pokerList){
	// toString(pokerList);
	var list = _.sortBy(pokerList,"val").reverse();
	list =  _.map(list,function(po){return po.str;});
	return list.join(",");
};


describe("poker rule", function() {
	it("straight",function(){
	  	pokerList = [
	  		new Poker("A",0),
	  		new Poker("K",1),
	  		new Poker("Q",0),
	  		new Poker("J",0),
	  		new Poker("10",0)
	  	];

	  	rst = rule(pokerList);
	  	// console.log(rst);
	  	expect(map(rst[0].pokerList)).toBe("A,K,Q,J,10");
  	});

	it("flush",function(){
	  	pokerList = [
	  		new Poker("A",0),
	  		new Poker("5",0),
	  		new Poker("Q",0),
	  		new Poker("J",0),
	  		new Poker("10",0)
	  	];

	  	rst = rule(pokerList);
	  	// console.log(rst);

	  	expect(map(rst[0].pokerList)).toBe("A,Q,J,10,5");
  	});

	

	it("royalFlush",function(){
		pokerList = [
			new Poker("A",0),
			new Poker("K",0),
			new Poker("Q",0),
			new Poker("J",0),
			new Poker("10",0)
		];
		rst = rule(pokerList);
		// toString(rst);
		expect(map(rst[0].pokerList)).toBe("A,K,Q,J,10");
	});

	it("fourKind",function(){
		pokerList = [
			new Poker("A",0),
			new Poker("A",1),
			new Poker("A",2),
			new Poker("A",3),
			new Poker("10",0)
		];
		rst = rule(pokerList);
		// toString(rst);
		expect(map(rst[0].pokerList)).toBe("A,A,A,A");
	});

	it("fullHouse",function(){
		pokerList = [
			new Poker("A",0),
			new Poker("A",1),
			new Poker("A",2),
			new Poker("10",3),
			new Poker("10",0)
		];
		rst = rule(pokerList);
		// toString(rst);
		expect(map(rst[0].pokerList)).toBe("A,A,A,10,10");
		expect(map(rst[1].pokerList)).toBe("A,A,A");
		expect(map(rst[2].pokerList)).toBe("10,10");
	});

	
	it("threeKind",function(){
		pokerList = [
			new Poker("A",0),
			new Poker("A",1),
			new Poker("A",2),
			new Poker("J",3),
			new Poker("10",0)
		];
		rst = rule(pokerList);
		// toString(rst);
		expect(map(rst[0].pokerList)).toBe("A,A,A");
		expect(map(rst[1].pokerList)).toBe("J");
		expect(map(rst[2].pokerList)).toBe("10");
	});

	it("twoPair",function(){
		pokerList = [
			new Poker("A",0),
			new Poker("A",1),
			new Poker("K",2),
			new Poker("K",3),
			new Poker("10",0)
		];
		rst = rule(pokerList);
		// toString(rst);
		expect(map(rst[0].pokerList)).toBe("A,A,K,K");
		expect(map(rst[1].pokerList)).toBe("A,A");
		expect(map(rst[2].pokerList)).toBe("K,K");
		expect(map(rst[3].pokerList)).toBe("10");
	});

	it("onePair",function(){
		pokerList = [
			new Poker("A",0),
			new Poker("A",1),
			new Poker("K",3),
			new Poker("Q",2),
			new Poker("10",0)
		];
		rst = rule(pokerList);
		// toString(rst);
		expect(map(rst[0].pokerList)).toBe("A,A");
		expect(map(rst[1].pokerList)).toBe("K");
		expect(map(rst[2].pokerList)).toBe("Q");
		expect(map(rst[3].pokerList)).toBe("10");
	});

	it("onePair",function(){
		pokerList = [
			new Poker("A",0),
			new Poker("5",1),
			new Poker("K",3),
			new Poker("Q",2),
			new Poker("10",0)
		];
		rst = rule(pokerList);
		// toString(rst);
		expect(map(rst[0].pokerList)).toBe("A");
		expect(map(rst[1].pokerList)).toBe("K");
		expect(map(rst[2].pokerList)).toBe("Q");
		expect(map(rst[3].pokerList)).toBe("10");
		expect(map(rst[4].pokerList)).toBe("5");
	});



});

function toString(obj){
	console.log(JSON.stringify(obj,undefined,4));
}