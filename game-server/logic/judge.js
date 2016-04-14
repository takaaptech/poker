var _ = require("underscore");

// 比较两组牌的大小
// 牌的格式来自rule的计算
/*
	[
		{pokeList:[],val:0},
		{pokeList:[],val:0},
		...
	]
*/
var judge = function(pa,pb){
	// flag -> pa 大于 pb
	// -1 表示 pa < pb
	// 0 表示 pa == pb
	// 1 表示 pa > pb
	var flag = 0;
	_.find(pa,function(a,i){
		var b = pb[i];
		if(a.val != b.val){
			flag = a.val > b.val ? 1 : -1;
			return true;
		}
	});
	return flag;
};

module.exports = judge;