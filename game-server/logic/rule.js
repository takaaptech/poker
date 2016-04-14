var _ = require("underscore");

function rule(pokerList){
	// 返回值格式
	/*
	[
		{pokerList:[],val:100},
		{}
	]
	*/
	// poker的格式 
	/*
		{tag:0,val:11,str:"J"}
	*/
	var dict = {
		// 同花顺
		royalFlush:function(pokerList){
			var flush = this.flush(pokerList);
			var straight = this.straight(pokerList);
			if(flush && straight){
				var maxVal = getMaxPoker(pokerList).val;
				return [{pokerList:flush[0].pokerList,val:scoreDict.royalFlush + maxVal*subTypeScoreRate}];
			}
		},
		fourKind:function(pokerList){
			var group = getGroup(pokerList);
			if(group["4"]){
				return [
					{pokerList:group["4"][0],val:scoreDict.fourKind + group["4"][0][0].val*subTypeScoreRate},
					{pokerList:group["1"][0],val:scoreDict.highCard + group["1"][0][0].val}
				];
			}
		},
		fullHouse:function(pokerList){
			var group = getGroup(pokerList);
			if(group["3"] && group["2"]){
				return [
					{pokerList:group["3"][0].concat(group["2"][0]),val:scoreDict.fullHouse},
					{pokerList:group["3"][0],val:group["3"][0][0].val * subTypeScoreRate},
					{pokerList:group["2"][0],val:group["2"][0][0].val * subTypeScoreRate}
				];
			}

		},
		flush:function(pokerList){
			var group = _.groupBy(pokerList,function(po){return po.tag;});
			if(_.size(group) == 1){
				var avgVal = getAvgPokerVal(pokerList);
				return [
					{pokerList:pokerList,val:scoreDict.flush + subTypeScoreRate*avgVal}
				];
			}
		},
		straight:function(pokerList){
			var sortList = _.sortBy(pokerList,'val').reverse();
			// console.log("straight");
			// console.log(JSON.stringify(sortList,undefined,4));
			var flag = true;
			for (var i = 0; i < sortList.length-1; i++) {
				var si = sortList[i];
				var nextSi = sortList[i+1];
				if(si.val != nextSi.val+1){
					flag = false;
					break;
				}
			};
			if(flag){
				var maxVal = getMaxPoker(pokerList).val;
				return [
					{pokerList:sortList, val:scoreDict.straight + maxVal*subTypeScoreRate }
				]; 
			}
		},
		threeKind:function(pokerList){
			var group = getGroup(pokerList);
			if(group["3"] && group["1"]){
				var rst = [];
				rst.push({pokerList:group["3"][0],val:scoreDict.threeKind + group["3"][0][0].val *subTypeScoreRate});
				_.each(group["1"],function(pl){
					rst.push({pokerList:pl,val:scoreDict.highCard + pl[0].val});
				});
				return rst;
			}
		},
		twoPair:function(pokerList){
			var group = getGroup(pokerList);
			if(group["2"] && group["2"].length == 2){
				var rst = [];
				rst.push({pokerList:group["2"][0].concat(group["2"][1]),val:scoreDict.twoPair});
				_.each(group["2"],function(pl){
					rst.push({pokerList:pl,val:pl[0].val});
				});
				rst.push({pokerList:group["1"][0],val:group["1"][0][0].val});
				return rst;
			}
		},
		onePair:function(pokerList){
			var group = getGroup(pokerList);
			if(group["2"] && group["2"].length == 1 && group["1"] && group["1"].length === 3){
				var rst = [];
				rst.push({pokerList:group["2"][0],val:scoreDict.onePair+ group["2"][0][0].val});
				_.each(group["1"],function(pl){
					rst.push({pokerList:pl,val:pl[0].val});
				});
				return rst;
			}
		},
		highCard:function(pokerList){
			var group = getGroup(pokerList);
			if(group["1"] && group["1"].length == 5){
				var rst = [];
				_.each(group["1"],function(pl){
					rst.push({pokerList:pl,val:pl[0].val});
				});
				return rst;
			}
		}
	};

	var rst;
	_.find(dict,function(v,k){
		rst = v.bind(dict)(pokerList);
		if(rst){
			return true;
		}
	});
	return rst;
};

// 根据点数来分组
/*
	{
		"3":[poker1,pok]
	}
*/
function getGroup(pokerList){
	var group =  _.groupBy(pokerList,function(po){
		return po.val;
	});

	group = _.sortBy(group,function(pokerList){
		return -pokerList[0].val;
	});

	var dict = {};
	_.each(group,function(v,k){
		if(!dict[v.length]){
			dict[v.length] = [v];
		}else{
			dict[v.length] = dict[v.length].concat([v]);
		}
	});

	// console.log(JSON.stringify(dict,undefined,4));
	return dict;
};

// 获取最大的poker(只根据点数)
function getMaxPoker(pokerList){
	return _.max(pokerList,function(po){
		return po.val;
	});
};

// 获取平均点数
function getAvgPokerVal(pokerList){
	return _.reduce(pokerList,function(memo,po){
		return memo + po.val;
	},0)/pokerList.length;
};




// 牌型分基数
var typeScoreRate = 0X100;
var subTypeScoreRate = 0x10;
// 牌型分字典
var scoreDict = {
    royalFlush:0x9 * typeScoreRate,
    fourKind:0x8 * typeScoreRate,
    fullHouse:0x7 * typeScoreRate,
    flush:0x6 * typeScoreRate,
    straight:0x5 * typeScoreRate,
    threeKind:0x4 * typeScoreRate,
    twoPair:0x3 * typeScoreRate,
    onePair:0x2 * typeScoreRate,
    highCard:0x1 * typeScoreRate
};

module.exports = rule;