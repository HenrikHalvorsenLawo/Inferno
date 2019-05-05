//
const args = getArgs()
const ServerAddress = args.ip // Externally Passed in IP Address of host
//
var http = require('http');
var fs = require('fs');
var request = require('request');
var WebSocket = require('ws');
var ws;
//
var Store = require('data-store');
var tmp = new Store({path:'.tmp.json'});
var store = new Store({path: 'alldata.json'});
//
var NUM_BYTES_RX_DATA = 6;
var NUM_BYTES_TX_DATA = 4;
var TxData = new Uint8Array(10);
var TxRdIndex = 0;
//
const path = __dirname + "/xml/"+ServerAddress+".xml"; // Destination of XML
var convert = require('xml-js');
var XMLWriter = require('xml-writer');
var format = require('xml-formatter');
//

function openSocket(SA){
    ws = new WebSocket("ws://"+SA+"/ppmetc",null,{handshakeTimeout:1000});
    ws.binaryType = 'arraybuffer';
    ws.onopen = function (event) {
        get_status(SA)
    };

    ws.onmessage = function (event) {
      ProcessRxData(event.data, function(wsdata){
      let url=event.target.url.replace(/\./g, "").replace(/ws:\/\//g,"").replace(/\/ppmetc/g, "")
      x=1
          try{
            if(
              tmp.get(url+'.gain')===gain && tmp.get(url+'.onair')===onair
            ){console.log(tmp.get(url+'.gain'),gain,tmp.get(url+'.onair'),onair,x)
          x++}
            else{
            tmp.set(url+'.gain',gain)
            tmp.set(url+'.onair',onair)
            write_gain_onair(SA,gain,onair)}
            get_status(SA)
            console.log('different',x)
          }
          catch(e){
            tmp.set(url+'.gain',gain)
            tmp.set(url+'.onair',onair)
          }
            })
    };
    ws.onerror = function (event){
        console.log('WS Error: '+event.message)
        setTimeout(function(){
            openSocket(SA)
        },10000);
    };
}

function write_gain_onair(SA,raw_gain_value, onair){
        var ipset=SA.replace(/\./g, "")
        var micline = tmp.get(ipset+'.micline')

    if (micline === "Line"){
        var gain_value = raw_gain_value - 128;
      }
        if (micline === "Mic+48V"){
        var gain_value = raw_gain_value - 93;
      }
        if (micline === "Mic"){
        var gain_value = raw_gain_value - 70;
      }
    store.set(tmp.get(ipset+'.custdns')+'.gain',""+gain_value+"");
    store.set(tmp.get(ipset+'.custdns')+'.onair',""+onair+"");
}

function ProcessRxData(RxData,wsdata){
    var ByteBuffer = new Uint8Array(RxData, 0, NUM_BYTES_RX_DATA);
    this.gain=ByteBuffer[5]
    this.onair=ByteBuffer[4]
    wsdata();
};
  
function get_status(ServerAddress)
{
    http.get("http://" + ServerAddress +"/get_sys_config.cgi?sys=net", (resp) => {
    let data = '';
    resp.on('data', (chunk) => {data += chunk;});
    resp.on('end', () => { 
    // Find Custom DNS
      var findcustdns = new RegExp("custdnsname=(.*)");
      var getcustdns = data.match(findcustdns); 
    // Find IP Addr 
      var findipaddr = new RegExp("ipaddr=(.*)");  
      var getipaddr = data.match(findipaddr);
    // Find Mac Addr 
      var findmacaddr = new RegExp("macaddr=(.*)");  
      var getmacaddr = data.match(findmacaddr);
    // Find Subnet Mask
      var findsubnet = new RegExp("submask=(.*)");
      var getsubnet = data.match(findsubnet);
    // Find Gateway IP Addr
      var findgwaddr = new RegExp("gwaddr=(.*)");
      var getgwaddr = data.match(findgwaddr);
    // Find GS DNS (Serial no.)
      var findserial = new RegExp("dnsname=(.*)");
      var getserial = data.match(findserial);

        sys(ServerAddress,function(sys_config){
            store.set(getcustdns[1]+'.micline',micline)
            store.set(getcustdns[1]+'.gainlock',gainlock)
            store.set(getcustdns[1]+'.miclock',miclock)
            store.set(getcustdns[1]+'.sidetone',sidetone)
        })
      store.set(getcustdns[1]+'.ipaddr',getipaddr[1])
      store.set(getcustdns[1]+'.subnet',getsubnet[1])
      store.set(getcustdns[1]+'.gwaddr',getgwaddr[1])
      store.set(getcustdns[1]+'.macaddr',getmacaddr[1])
      store.set(getcustdns[1]+'.serial',getserial[1])
      store.set(getcustdns[1]+'.custdns',getcustdns[1])

      var ipset=getipaddr[1].replace(/\./g, "")
      tmp.set(ipset+'.micline',store.get(getcustdns[1]+'.micline'))
      tmp.set(ipset+'.custdns',store.get(getcustdns[1]+'.custdns'))
     })
   });

function sys(ServerAddress, sys_config){
   http.get("http://" + ServerAddress + "/get_misc1_config.cgi?sys=misc1", (resp) => {
    let data = '';
    resp.on('data', (chunk) => {data += chunk;});
    resp.on('end', () => {
  // Get Mic Status
     var findmicstatus = new RegExp("micline=(.*)");  
     var getmicstatus = data.match(findmicstatus);
     var getmiclinepre = getmicstatus[1];
        if (getmiclinepre === "0") {
        var getmiclinepost = "Line"}
        if (getmiclinepre === "1") {
        var getmiclinepost = "Mic+48V"}
        if (getmiclinepre === "2") {
        var getmiclinepost = "Mic"}
  // Get Sidetone Status
     var findsidetonestatus = new RegExp("sidetone=(.*)");  
     var getsidetonestatus = data.match(findsidetonestatus);
  // Get MicLine Lock Status
     var findmiclockstatus = new RegExp("mllock=(.*)");
     var getmiclockstatus = data.match(findmiclockstatus);
     var getmiclockstatuspre = getmiclockstatus[1];
        if (getmiclockstatuspre ==="true"){
        var getmiclockstatuspost = "1"}
        if (getmiclockstatuspre ==="false"){
        var getmiclockstatuspost = "0"}
  // Get GainLock Lock Status
     var findgainlockstatus = new RegExp("gainlock=(.*)");
     var getgainlockstatus = data.match(findgainlockstatus);
     var getgainlockstatuspre = getgainlockstatus[1];
        if (getgainlockstatuspre ==="true"){
        var getgainlockstatuspost ="1"}
        if (getgainlockstatuspre ==="false"){
        var getgainlockstatuspost ="0"}

     this.miclock=getmiclockstatuspost
     this.gainlock=getgainlockstatuspost
     this.sidetone=getsidetonestatus[1]
     this.micline=getmiclinepost
     this.gainlock=getgainlockstatuspost;
     sys_config();
    })
   })
  };

};

module.exports={openSocket}


/*
function write_xml()
{
var string = store.json(null, 2);
console.log (string);

    xw = new XMLWriter;
    xw.startElement('Data');
        xw.startElement('INFERNO_DATA');
        xw.startElement('CHILD_1');
        xw.writeAttribute('OBJECT', 'IP');
        xw.writeAttribute('VALUE', ipaddr);
        xw.endElement();
        xw.startElement('CHILD_2');
        xw.writeAttribute('OBJECT', 'GW');
        xw.writeAttribute('VALUE', gwaddr);
        xw.endElement();
        xw.startElement('CHILD_3');
        xw.writeAttribute('OBJECT', 'MAC');
        xw.writeAttribute('VALUE', macaddr);
        xw.endElement();
        xw.startElement('CHILD_4');
        xw.writeAttribute('OBJECT', 'SERIAL');
        xw.writeAttribute('VALUE', serial);
        xw.endElement();
        xw.startElement('CHILD_5');
        xw.writeAttribute('OBJECT', 'CUSTOMNAME');
        xw.writeAttribute('VALUE', custdns);
        xw.endElement();
        xw.startElement('CHILD_6');
        xw.writeAttribute('OBJECT', 'MICLINE');
        xw.writeAttribute('VALUE', miclineverbose);
        xw.endElement();
        xw.startElement('CHILD_7');
        xw.writeAttribute('OBJECT', 'MICLOCK');
        xw.writeAttribute('VALUE', miclockstatus);
        xw.endElement();
        xw.startElement('CHILD_8');
        xw.writeAttribute('OBJECT', 'GAINLOCK');
        xw.writeAttribute('VALUE', gainlockstatus);
        xw.endElement();
        xw.startElement('CHILD_9');
        xw.writeAttribute('OBJECT', 'SIDETONE');
        xw.writeAttribute('VALUE', sidetonestatus);
        xw.endElement();
        xw.startElement('CHILD_10');
        xw.writeAttribute('OBJECT', 'ONAIR');
        xw.writeAttribute('VALUE', on_air_value);
        xw.endElement();
        xw.startElement('CHILD_11');
        xw.writeAttribute('OBJECT', 'GAIN');
        xw.writeAttribute('VALUE', gain_value);
        xw.endElement();  
    xw.endDocument();
        var formattedxml = format(xw.toString());
        fs.writeFileSync(path, (formattedxml), 'utf8');
    }

catch (e)   {
                fs.writeFileSync (jsonpath,(jsonarray),'utf-8')
            }
};
*/
function SendTxData()
{
    var requestpath = __dirname + "/json/requests_"+ServerAddress+".json"
    try {
        fs.statSync(requestpath)
        {
        var requestarray;
        try {
        var requestarray = JSON.parse(fs.readFileSync(requestpath, 'utf-8'));
    
    } catch(e){
    }
        var var1 = requestarray[1];
        var var2 = requestarray[2];
        var emptyarray= JSON.stringify([0,0,0]);
        fs.writeFileSync(requestpath, (emptyarray), 'utf-8');
        if (var1 ===0){
        }
        else{
        if (var1 === 1)
    {
            if (var2 ===0){
                var OnAir = 1;
            }
            if (var2 ===1){
                var GainUp = 1;
            }
            if (var2 ===2){
                var GainDown = 1;
            }
            else{var GainLineUp = 0}

        TxRdIndex = TxRdIndex + NUM_BYTES_TX_DATA;
        if(TxRdIndex === (10* NUM_BYTES_TX_DATA)) 
            TxRdIndex = 0x00;    
                ws.binaryType = 'arraybuffer';
                    TxData[0] = GainUp;
                    TxData[1] = GainDown;
                    TxData[2] = GainLineUp;
                    TxData[3] = OnAir;
                ws.send(TxData.buffer);
            //Absolutley no idea why you have to send another string if you've changed the OnAir status...
                    TxData[0] = 0;
                    TxData[1] = 0;
                    TxData[2] = 0;
                    TxData[3] = 0;
                    TxData[4] = 1;
                ws.send(TxData.buffer);
    }
        if (var1 === 2){
            if (var2 === "Line"){
                request.get('http://'+ServerAddress+'/set_misc1_config.cgi?sys=misc1&micline=0').on('error', function(err){})
                }
            if (var2 === "Mic"){
                request.get('http://'+ServerAddress+'/set_misc1_config.cgi?sys=misc1&micline=2').on('error', function(err){})
                }
            if (var2 === "Mic+48V"){
                request.get('http://'+ServerAddress+'/set_misc1_config.cgi?sys=misc1&micline=1').on('error', function(err){})
                }
                }
        if (var1 === 3){
                request.get('http://'+ServerAddress+'/set_misc1_config.cgi?sys=misc1&sidetone='+var2).on('error', function(err){})
                }
        if (var1 === 4){
            if (var2 === 0){
                request.get('http://'+ServerAddress+'/set_misc1_config.cgi?sys=misc1&gainlock=false').on('error', function(err){})
                }
            if (var2 === 1){
                request.get('http://'+ServerAddress+'/set_misc1_config.cgi?sys=misc1&gainlock=true').on('error', function(err){})
                }
            }
        if (var1 === 5){
            if (var2 === 0){
                request.get('http://'+ServerAddress+'/set_misc1_config.cgi?sys=misc1&mllock=false').on('error', function(err){})
                }
            if (var2 === 1){
                request.get('http://'+ServerAddress+'/set_misc1_config.cgi?sys=misc1&mllock=true').on('error', function(err){})
                }
            }
    }
}
} catch(e){
    console.log('NO JSON File @ '+requestpath)
}
}

function getArgs () {
    const args = {}
    process.argv
      .slice(2, process.argv.length)
      .forEach( arg => {
        // long arg
        if (arg.slice(0,2) === '--') {
          const longArg = arg.split('=')
          args[longArg[0].slice(2,longArg[0].length)] = longArg[1]
        }
       // flags
        else if (arg[0] === '-') {
          const flags = arg.slice(1,arg.length).split('')
          flags.forEach(flag => {
            args[flag] = true
          })
        }
      })
    return args
  }


