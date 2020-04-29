(function define_horde_Mouse () {

horde.Mouse = function (canvas) {
	this.buttonStates = {};
	this.mouseX = 0;
	this.mouseY = 0;
	this.canvas = canvas;
	this.lastButtonStates = {};
	horde.on("mousemove", this.handleMouseMove, canvas, this);
	horde.on("mousedown", this.handleMouseDown, canvas, this);
	horde.on("mouseup", this.handleMouseUp, window, this);


	// Mobile Phone
    this.isTouchDevice = false;
	horde.on("touchmove", this.handleTouchDown, canvas, this);
	horde.on("touchstart", this.handleTouchDown, canvas, this);
	horde.on("touchend", this.handleTouchUp, canvas, this);

};

var Mouse = horde.Mouse;
var proto = Mouse.prototype;

Mouse.Buttons = {
	LEFT: 0,
	RIGHT: 2
};

proto.handleMouseMove = function (e) {
	/*
	// Mobile Phone
	var touch = e.touches[0];
	e = {
		clientX: touch.pageX,
		clientY: touch.pageY
	};
	*/

	var offset = horde.getOffset(this.canvas);
	this.mouseX = (((e.clientX - offset.x) * 640) / this.canvas.offsetWidth);
	this.mouseY = (((e.clientY - offset.y) * 480) / this.canvas.offsetHeight);
	this.hasMoved = true;
};

proto.handleMouseDown = function (e) {
	// iOS
	/*
	this.buttonStates[Mouse.Buttons.LEFT] = true;
	or e.button = Mouse.Buttons.LEFT;
	*/
	this.buttonStates[e.button] = true;
	horde.stopEvent(e);
	if (window.focus) window.focus();
};

proto.handleMouseUp = function (e) {
	// iOS
	/*
	this.buttonStates[Mouse.Buttons.LEFT] = true;
	or e.button = Mouse.Buttons.LEFT;
	*/
	this.buttonStates[e.button] = false;
};

proto.handleTouchDown = function (e) {
	this.isTouchDevice = true;
    let touch = e.touches[0];
	const clientX = touch.pageX;
    const clientY = touch.pageY;

    let offset = horde.getOffset(this.canvas);
    this.mouseX = (((clientX - offset.x) * 640) / this.canvas.offsetWidth);
    this.mouseY = (((clientY - offset.y) * 480) / this.canvas.offsetHeight);
    this.hasMoved = true;

    this.buttonStates[Mouse.Buttons.LEFT] = true;

	if (window.focus) window.focus();
};

proto.handleTouchUp = function (e) {
    this.isTouchDevice = true;
	this.buttonStates[Mouse.Buttons.LEFT] = false;
};


proto.isButtonDown = function (button) {
	return this.buttonStates[button];
};

proto.isAnyButtonDown = function () {
	for (var key in this.buttonStates) {
		if (this.buttonStates[key]) {
			return true;
		}
	}

	return false;
};

proto.clearButtons = function () {
	this.buttonStates = {};
};

proto.wasButtonClicked = function (button) {
	return (this.buttonStates[button] && !this.lastButtonStates[button]);
};

proto.storeButtonStates = function () {
	for (var key in this.buttonStates) {
		this.lastButtonStates[key] = this.buttonStates[key];
	}
};

}());
