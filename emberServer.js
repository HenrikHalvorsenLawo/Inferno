/* eslint-disable no-console */
//
var fs = require("fs");
var WebSocket = require("ws");
var ws;
//
var NUM_BYTES_RX_DATA = 6;
var NUM_BYTES_TX_DATA = 4;
var TxData = new Uint8Array(10);
var TxRdIndex = 0;
//
var ember = require("emberplus");
var TreeServer = ember.TreeServer;
var jsonTree = JSON.parse(fs.readFileSync("tree.json"));
var objEmberTree = TreeServer.JSONtoTree(jsonTree);
const server = new TreeServer("0.0.0.0", 9090, objEmberTree);

server.listen().then(() => {
	console.log("Ember+ Server Started at TCP 0.0.0.0:9090");
}).catch((e) => { console.log(e.stack); });

//server._debug = true;
server.on("value-change", (element) => {
	if (element.contents.identifier === "gain") {
		console.log(element.contents.value);
		// Do something with it here!
	} else if (element.contents.identifier === "onair") {
		// Same deal!
	}
});

// // eslint-disable-next-line no-unused-vars
// function openSocket(SA){
// 	ws = new WebSocket("ws://"+SA+"/ppmetc",null,{handshakeTimeout:1000});
// 	ws.binaryType = "arraybuffer";
// 	ws.onopen = function (event) {
// 		get_status(SA);
// 	};

// 	ws.onmessage = function (event) {
// 		ProcessRxData(event.data, function(wsdata){
// 			let url=event.target.url.replace(/\./g, "").replace(/ws:\/\//g,"").replace(/\/ppmetc/g, "");
// 			x=1;
// 			try{
// 				if(
// 					tmp.get(url+".gain")===gain && tmp.get(url+".onair")===onair
// 				){console.log(tmp.get(url+".gain"),gain,tmp.get(url+".onair"),onair,x);
// 					x++;}
// 				else{
// 					tmp.set(url+".gain",gain);
// 					tmp.set(url+".onair",onair);
// 					write_gain_onair(SA,gain,onair);}
// 				get_status(SA);
// 				console.log("different",x);
// 			}
// 			catch(e){
// 				tmp.set(url+".gain",gain);
// 				tmp.set(url+".onair",onair);
// 			}
// 		});
// 	};
// 	ws.onerror = function (event){
// 		console.log("WS Error: "+event.message);
// 		setTimeout(function(){
// 			openSocket(SA);
// 		},10000);
// 	};
// }

// function write_gain_onair(SA,raw_gain_value, onair){
// 	var ipset=SA.replace(/\./g, "");
// 	var micline = tmp.get(ipset+".micline");

// 	if (micline === "Line"){
// 		var gain_value = raw_gain_value - 128;
// 	}
// 	if (micline === "Mic+48V"){
// 		var gain_value = raw_gain_value - 93;
// 	}
// 	if (micline === "Mic"){
// 		var gain_value = raw_gain_value - 70;
// 	}
// 	store.set(tmp.get(ipset+".custdns")+".gain",""+gain_value+"");
// 	store.set(tmp.get(ipset+".custdns")+".onair",""+onair+"");
// }

// function ProcessRxData(RxData,wsdata){
// 	var ByteBuffer = new Uint8Array(RxData, 0, NUM_BYTES_RX_DATA);
// 	this.gain=ByteBuffer[5];
// 	this.onair=ByteBuffer[4];
// 	wsdata();
// }
  

// function SendTxData()
// {
// 	try {
// 		{
// 			var requestarray;
			
// 			var var1 = requestarray[1];
// 			var var2 = requestarray[2];
// 			var emptyarray= JSON.stringify([0,0,0]);
// 			fs.writeFileSync(requestpath, (emptyarray), "utf-8");
// 			if (var1 ===0){
// 			}
// 			else{
// 				if (var1 === 1)
// 				{
// 					if (var2 ===0){
// 						var OnAir = 1;
// 					}
// 					if (var2 ===1){
// 						var GainUp = 1;
// 					}
// 					if (var2 ===2){
// 						var GainDown = 1;
// 					}
// 					else{var GainLineUp = 0;}

// 					TxRdIndex = TxRdIndex + NUM_BYTES_TX_DATA;
// 					if(TxRdIndex === (10* NUM_BYTES_TX_DATA)) 
// 						TxRdIndex = 0x00;    
// 					ws.binaryType = "arraybuffer";
// 					TxData[0] = GainUp;
// 					TxData[1] = GainDown;
// 					TxData[2] = GainLineUp;
// 					TxData[3] = OnAir;
// 					ws.send(TxData.buffer);
// 					//Absolutley no idea why you have to send another string if you've changed the OnAir status...
// 					TxData[0] = 0;
// 					TxData[1] = 0;
// 					TxData[2] = 0;
// 					TxData[3] = 0;
// 					TxData[4] = 1;
// 					ws.send(TxData.buffer);
// 				}
// 				if (var1 === 2){
// 					if (var2 === "Line"){
// 						request.get("http://"+ServerAddress+"/set_misc1_config.cgi?sys=misc1&micline=0").on("error", function(err){});
// 					}
// 					if (var2 === "Mic"){
// 						request.get("http://"+ServerAddress+"/set_misc1_config.cgi?sys=misc1&micline=2").on("error", function(err){});
// 					}
// 					if (var2 === "Mic+48V"){
// 						request.get("http://"+ServerAddress+"/set_misc1_config.cgi?sys=misc1&micline=1").on("error", function(err){});
// 					}
// 				}
// 				if (var1 === 3){
// 					request.get("http://"+ServerAddress+"/set_misc1_config.cgi?sys=misc1&sidetone="+var2).on("error", function(err){});
// 				}
// 				if (var1 === 4){
// 					if (var2 === 0){
// 						request.get("http://"+ServerAddress+"/set_misc1_config.cgi?sys=misc1&gainlock=false").on("error", function(err){});
// 					}
// 					if (var2 === 1){
// 						request.get("http://"+ServerAddress+"/set_misc1_config.cgi?sys=misc1&gainlock=true").on("error", function(err){});
// 					}
// 				}
// 				if (var1 === 5){
// 					if (var2 === 0){
// 						request.get("http://"+ServerAddress+"/set_misc1_config.cgi?sys=misc1&mllock=false").on("error", function(err){});
// 					}
// 					if (var2 === 1){
// 						request.get("http://"+ServerAddress+"/set_misc1_config.cgi?sys=misc1&mllock=true").on("error", function(err){});
// 					}
// 				}
// 			}
// 		}
// 	} catch(e){
// 		console.log("NO JSON File @ "+requestpath);
// 	}
// }

// function getArgs () {
// 	const args = {};
// 	process.argv
// 		.slice(2, process.argv.length)
// 		.forEach( arg => {
// 			// long arg
// 			if (arg.slice(0,2) === "--") {
// 				const longArg = arg.split("=");
// 				args[longArg[0].slice(2,longArg[0].length)] = longArg[1];
// 			}
// 			// flags
// 			else if (arg[0] === "-") {
// 				const flags = arg.slice(1,arg.length).split("");
// 				flags.forEach(flag => {
// 					args[flag] = true;
// 				});
// 			}
// 		});
// 	return args;
// }


