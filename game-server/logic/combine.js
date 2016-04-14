var _ = require("underscore");

// list 集合
// count 在集合中要取的个数
var combine = function(list,count){
	var allIndexList = memoGetIndexList(list.length,count);
	// console.log(allIndexList);
	var picks = [];
	_.each(allIndexList,function(indexList){
		var arr = [];
		_.each(indexList,function(n,i){
			if(n==1){
				arr.push(list[i]);
			}
		});
		picks.push(arr);
	});
	return picks;
};


var getIndexList = function(len,count){
	var rst = [];
	var sum = Math.pow(2,len);
	for (var i = 0; i < sum; i++) {
		var binStr =  i.toString(2);
		if(binStr.replace(/0/g,"").length == count){
			binStr = (Math.pow(10,len)+(binStr-0)+'').substr(1);
			var arr =binStr.split("");
			rst.push(arr);
		}

	};
	return rst;
};

var memoGetIndexList = _.memoize(getIndexList,function(len,count){return [len,count].join(",");});

module.exports = combine;