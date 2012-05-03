var Signaling = {

    fifoId : null,   // fifo for receiving signaling messages
    roomNum : null,
    remoteFifoId : new Array(), // fifo for sending signaling messages
    Peer : new Array(),     // PeerConnection instance
    chatReady : new Array(),
    eventSrc : null,
    peerIndex : 0,
    connectionIndex : 0,
    chatIndex : 0,
    readIndex : 0,
    CanvasContext : new Array(),
    PeerDrawingInfo : new Array(),
    drawHistory : new Array(),
    mySeqNum : 0,
    peerSeqNum : new Array(),
    seenHistory : false,
    myName : null,
    peerName : new Array(),
    peerColor : new Array(),
    remoteDataChannel : new Array(),
    
    TURN_CONFIG : "TURN 193.234.219.124:3478",
    //TURN_CONFIG : "NONE",

    // ===== Initial handshake

    // create(): inviter receives a FIFO id from the server 
    create : function(on_url_created, host) { 

	myName = prompt("Please enter your name","");
	if (myName != null && myName !="")
  	{
  		console.log("Name entered:" + myName);
  		Signaling.myName = myName;
  	}
  	else
  	{
  		console.log("HANDLE THIS!!!");
  	}

	var createClient = new XMLHttpRequest();
	
	createClient.open("GET", "create.php?host="+host, true);
	createClient.send(null);
	createClient.onreadystatechange = function () {
	    if (this.readyState === 4 && this.status === 200) {
		var resp = this.responseText.replace(/^\s*/, "").replace(/\s*$/, "");
		Signaling.roomNum = resp.split(":")[0];
		Signaling.fifoId = resp.split(":")[1];
		Signaling.eventSrc = new EventSource("recv.php?id=" + Signaling.fifoId);
		Signaling.eventSrc.addEventListener("message", Signaling.onSigMsg);
		console.log("listening to " + Signaling.fifoId);
		var url_base = location.href.substring(0,location.href.lastIndexOf('/'));
		on_url_created(url_base + "/accept.html?id=" + Signaling.roomNum, Signaling.fifoId);
	    }
	};
    },

    accept : function(roomNum) {
	console.log("trying to join a new room: " + roomNum);
	Signaling.roomNum = roomNum;
	//Signaling.remoteFifoId[Signaling.connectionIndex] = remoteFifoId;
	Signaling.sendSigMsg("" + Signaling.fifoId);
	
    },

    // ===== Sending messages

    // sendSigMsg() sends a msg to the server via XHR
    sendSigMsg : function(msg) {  
	console.log("sending to room:" + Signaling.roomNum + " " + msg);
	var sendClient = new XMLHttpRequest();
	sendClient.onreadystatechange = function() {};
	sendClient.open("POST", "post.php", true);
	sendClient.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
	sendClient.send("id=" + Signaling.roomNum + "&msg=" + encodeURIComponent(msg), true);
    },
    // ===== Receiving messages

    // onSigMsg is invoked when receiving event/signaling message
    // from the server. It pushes the signaling message down to
    // PeerConnection.
    onSigMsg : function (event) {
	var msg = JSON.parse(event.data).msgBody;
	console.log("incoming message the message was: " + msg);
	if(msg.indexOf("SDP")==-1) {
	    // This is a fifoId
	    console.log("we got a fifoId");
	    Signaling.remoteFifoId[msg] = msg;

	    Signaling.Peer[msg] = new webkitPeerConnection(Signaling.TURN_CONFIG, function(msgcontents) {
		console.log("sending to peer: " + msg);
		var sendClient = new XMLHttpRequest();
		sendClient.onreadystatechange = function() {};
		sendClient.open("POST", "post2.php", true);
		sendClient.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		var escaped = msgcontents.replace(/\r\n/g,"\\r\\n").replace(/\n/g,"\\n");
		console.log("sending my name which is :" + Signaling.myName);
		var sdpMsg = { src : Signaling.fifoId , sdp : encodeURIComponent(escaped), peerName : Signaling.myName };
		//alert(JSON.stringify(sdpMsg));
		sendClient.send("id=" + msg + "&msg=" + JSON.stringify(sdpMsg) , true);
		//alert("finished sending sdp msg to peer : " + msg);
	    });
	    console.log("Peer connection obj : " + Signaling.Peer[msg].readyState);
	    Signaling.Peer[msg].onconnecting = Signaling.onconnectingInternal;
	    Signaling.Peer[msg].onopen = Signaling.onopenInternal;
	}
	else {
	    //This is a SDP message
	    var sdpMsg = JSON.parse(msg);
	   
	    sdpMsg.sdp = sdpMsg.sdp.replace(/\\r\\n/g,"\r\n").replace(/\\n/g,"\n");
	    console.log("sdpMsg's src : " +sdpMsg.src + " name is : " + sdpMsg.peerName );
	    console.log("Peers that I have fifoId's for: ");

	    if(sdpMsg.sdp.indexOf("m=audio")!=-1) {
		Signaling.Peer[sdpMsg.src].processSignalingMessage(sdpMsg.sdp);
		return;
	    }
	    
	    var new_msg = sdpMsg.src;
	    var peerName = sdpMsg.peerName;
	    
	    console.log("assigning peer name here! " + peerName);
	    Signaling.peerName[new_msg] = peerName;
	    
	    if(!(sdpMsg.src in Signaling.remoteFifoId)) {
		
		console.log("peer name is :" + peerName);
		
		Signaling.remoteFifoId[new_msg] = new_msg;
		
		Signaling.Peer[new_msg] = new webkitPeerConnection(Signaling.TURN_CONFIG, function(msgcontents) {
		    console.log("sending to peer: " + new_msg);
		    var sendClient = new XMLHttpRequest();
		    sendClient.onreadystatechange = function() {};
		    sendClient.open("POST", "post2.php", true);
		    sendClient.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		    var escaped = msgcontents.replace(/\r\n/g,"\\r\\n").replace(/\n/g,"\\n");
		    console.log("sending my name which is :" + Signaling.myName);
		    var mySdpMsg = { src : Signaling.fifoId , sdp : encodeURIComponent(escaped) , peerName : Signaling.myName };
		    //alert(JSON.stringify(mySdpMsg));
		    sendClient.send("id=" + new_msg + "&msg=" + JSON.stringify(mySdpMsg) , true);
		    //alert("finished sending sdp msg to peer : " + new_msg);
		});
		console.log("Peer connection obj : " + Signaling.Peer[new_msg].readyState);
		Signaling.Peer[new_msg].onconnecting = Signaling.onconnectingInternal;
		Signaling.Peer[new_msg].onopen = Signaling.onopenInternal;
	    }
	    Signaling.Peer[sdpMsg.src].processSignalingMessage(sdpMsg.sdp);
	    Signaling.chatReady[sdpMsg.src] = true;
	}
    },

    // proxy methods for onconnecting()/onopen()

    onconnectingInternal : function() {
	if (Signaling.onconnecting) {
	    Signaling.onconnecting();
	}
    },

    onopenInternal : function() {
	if (Signaling.onopen) {
	    Signaling.onopen();
	}
    },

    

}; //end of Signaling




