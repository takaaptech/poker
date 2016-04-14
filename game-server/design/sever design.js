服务器设计:

1 user server (用户信息服务器)
* 用以注册登陆,连接数据库
* 获取某个用户的信息(比如代币)
userRemote
	-> add(userName) // 用以记录在线人数
	-> remove(userName)
	-> getMember(userName)
	** userName忽略的时候,返回所有玩家信息
	
2 hall server (大厅服务器)
hallHandler
	* 获取房间列表
		-> getRoomList()
	* 创建房间
		-> createRoom(roomName)
		** 默认创建50个房间
	* 删除房间
		-> removeRoom();
	* 进入房间
		-> enterRoom(roomName)
	* 退出房间
		-> quitRoom()
hallRemote
	* 进入大厅
		-> enterHall()
	* 退出大厅 
		-> quitHall()