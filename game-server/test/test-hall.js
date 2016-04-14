var _ = require("underscore");
var Hall = require("../logic/hall");


describe("test-hall",function(){
	console.log("test-hall.js");

	var hall,room;
	beforeEach(function(){
		hall = new Hall("hall0");
	});

	it("createRoom && removeRoom",function(){
		hall.createRoom("room0");
		hall.createRoom("room1");

		expect(hall.roomList.length).toBe(2);
	
		hall.removeRoom("room0");
		expect(hall.roomList.length).toBe(1);
	});



	it("enterRoom",function(){
		hall.createRoom("room0");
		hall.enterRoom("room0","dino");

		room = hall.findRoom("room0");
		expect(room.playerList.length).toBe(9);
		expect(_.filter(room.playerList,function(p){return p;}).length).toBe(1);
	});

});

