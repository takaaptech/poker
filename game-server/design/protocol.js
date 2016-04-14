* reg 注册
'REQ'
{
	userName:"abc123",
	password:"falcon"
}
'RES'
{

}
* login 登陆(进入大厅,获取所有房间)
'REQ'
{
	userName:"abc123",
	password:"falcon"
}
'PUSH' getRoomList
{
	roomList:[
		{roomName:"r123",playerCount:3,status:'playing'/*rest,playing*/}
	]
}
* createRoom 开设房间
'REQ'
{
	roomName:"r123"
}
'PUSH' refreshRoomList
{
	roomList:{
		add:[],
		remove:[],
		update:[]
	}
}
* enterRoom 进入房间
'REQ'
{
	roomName:"r123",
	seatIndex:4
}
'PUSH' refreshPlayerListInRoom
{
	playerList:[
		{playerName:"puman",playerColor:"red",status:"ready"/*notReady,ready*/}
	]
}
'PUSH' refreshRoomList
* quitRoom 退出房间
'REQ'
null
如果退出的玩家是最后一个玩家,则 'PUSH' refreshRoomList
* setRoomPwd 设置房间密码 // 暂时保留
* destroyRoom 关闭房间 // 包含在quitRoom中
* beReady 玩家准备,有2个以及2个以上玩家准备的时候,游戏开始
'REQ'
null
'PUSH' refreshPlayerListInRoom

* kickPlayer 踢出某位玩家 // 暂时保留


/////////////////////////////////////////////////////////////
流程
* holeCard,给玩家发私牌2张 'PUSH'
{

	playerColor:"red",
	// 这个信息push给green玩家的时候,就没有pokerList项了
	pokerList:[
		{str:"A",tag:0}, // 黑桃A
		{str:"5",tag:1} // 红桃5
	]
}
* flop,发公牌3张 'PUSH'
{
	pokerList:[
		{str:"A",tag:0}, // 黑桃A
		{str:"5",tag:1}, // 红桃5
		{str:"5",tag:2} // 梅花5
	]
}
* turn,发公牌1张
{
	pokerList:[
		{str:"5",tag:2} 
	]
}
* river,发公牌1张
{
	pokerList:[
		{str:"5",tag:2} 
	]
}


* 获得说话权 getCtrl 
{
	playerColor:"red"
}
* 下注 bet
'REQ'
{
	betMoney:20 // 加20个金币
}
'PUSH' 
{	
	playerColor:"red",
	betMoney:20
}
* 不加注 check
'REQ'
null
* 随注 call
'REQ'
null
* 加注 raise
'REQ'
{
	betMoney:100
}
* 全压 allIn
'REQ'
null
* 退出本局 fold
'REQ'
null
