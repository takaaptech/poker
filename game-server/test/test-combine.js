var _ = require("underscore");
var combine = require("../logic/combine");


describe("test combine",function(){
	it("pick 3 items from [1,2,3,4,5]",function(){
		var list = [1,2,3,4,5];
		var count = 3;
		var rst = combine(list,count);
		var exp = [
			[1,2,3],
			[1,2,4],
			[1,2,5],
			[1,3,4],
			[1,3,5],
			[1,4,5],
			[2,3,4],
			[2,3,5],
			[2,4,5],
			[3,4,5]
		];
		var mapRst = map(rst);
		var mapExp = map(exp);
		expect(mapRst).toBe(mapExp);
	});

function map(arr){
	var rst = _.map(arr,function(n){
		return n.sort(function(a,b){return b-a;}).join();
	}).sort().join("#");
	return rst;
};

});
