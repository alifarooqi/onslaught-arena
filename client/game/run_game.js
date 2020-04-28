
var ENGINE = new horde.Engine();
ENGINE.run();

const cancelLoading = ()=>{
	document.getElementById('loading').style.display = 'none';
	ENGINE.cancelLoadingAndQuit();
    // ENGINE.state = "title";
	SOCKET.cancelFindPartner();
};

const startPractice = ()=>{
	document.getElementById('loading').style.display = 'none';
    ENGINE.multiplayerType = "single";
    ENGINE.state = "intro_cinematic";

};

const hideMatchPartner = () => {
    document.getElementById('match-loading').style.display = 'none';
    ENGINE.hideMatchPartnerScreen();
};


