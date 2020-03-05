// (function () {
	var e = new horde.Engine();
	e.run();

	const cancelLoading = ()=>{
        document.getElementById('loading').style.display = 'none';
        e.state = "title";
        SOCKET.cancelFindPartner();
	};



// }());
