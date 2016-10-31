var droppables = new Array();
var itemBeingDragged = null;
var mouseDownPoint = {x: 0, y: 0};

function onDocumentMouseMove(mouseMoveEvent) {
	var point = {x: mouseMoveEvent.pageX, y: mouseMoveEvent.pageY};
	
	itemBeingDragged.dragTo(point);

	for (var i = 0; i < droppables.length; i++) {
		if (droppables[i].contains(point) && !droppables[i].isBeingDraggedOver) {
			droppables[i].onDragEnter();
		} else if (!droppables[i].contains(point) && droppables[i].isBeingDraggedOver) {
			droppables[i].onDragExit();
		}
	}
}

function onDocumentMouseUp(mouseUpEvent) {
	for (var i = 0; i < droppables.length; i++) {
		if (droppables[i].isBeingDraggedOver) {
			droppables[i].onDragDrop(itemBeingDragged);
		}
	}
	
	itemBeingDragged.reset(mouseUpEvent);
}

var Draggable = function(elementId) {
	this.init(elementId);
};

Draggable.prototype = {
	init: function(element) {
		if (typeof element === "string") element = document.getElementById(element);
		
		this.element = element;
		this.element.className += "draggable";
		
		var self = this;
		
		this.element.onmousedown = function(mouseDownEvent) {
			this.style.zIndex = "1000";
			
			itemBeingDragged = self;
			
			mouseDownPoint.x = mouseDownEvent.pageX;
			mouseDownPoint.y = mouseDownEvent.pageY;
			
			document.onmousemove = onDocumentMouseMove;
			document.onmouseup = onDocumentMouseUp;
		};
	},
	
	dragTo: function(point) {
		this.element.style.left = (point.x - mouseDownPoint.x) + "px";
		this.element.style.top = (point.y - mouseDownPoint.y) + "px";
	},
	
	reset: function() {
		this.element.style.zIndex = "";
		this.element.style.left = "";
		this.element.style.top = "";
			
		itemBeingDragged = null;
			
		mouseDownPoint.x = 0;
		mouseDownPoint.y = 0;

		document.onmousemove = null;
		document.onmouseup = null;
	}
};


var Droppable = function(element, customDragDrop) {
	this.init(element, customDragDrop);
};

Droppable.prototype = {
	init: function(element, customDragDrop) {
		if (typeof element === "string") element = document.getElementById(element);
		
		this.element = element;
		this.isBeingDraggedOver = false;
		this.customDragDrop = customDragDrop;
		
		droppables.push(this);
	},
	
	position: function() {
		var position = {x: this.element.offsetLeft, y: this.element.offsetTop};
		
		var offsetParent = this.element.offsetParent;
		while (offsetParent) {
			position.x += offsetParent.offsetLeft;
			position.y += offsetParent.offsetTop;
			offsetParent = offsetParent.offsetParent;
		}
		
		return position;
	},
	
	contains: function(point) {
		var topLeft = this.position();
		var bottomRight = {
			x: topLeft.x + this.element.offsetWidth,
			y: topLeft.y + this.element.offsetHeight
		};
		
		return (
			topLeft.x < point.x
			&& topLeft.y < point.y
			&& point.x < bottomRight.x
			&& point.y < bottomRight.y
		);
	},
	
	onDragEnter: function() {
		this.isBeingDraggedOver = true;
		this.element.className += "dragOver";
	},
	
	onDragExit: function() {
		this.isBeingDraggedOver = false;
		this.element.className = this.element.className.replace(/\bdragOver\b/, "");
	},
	
	onDragDrop: function(draggable) {
		this.onDragExit();
		this.customDragDrop(draggable);
	}
};


window.onload = function() {
	var data = [
		"Tarjeta uno",
		"Tarjeta dos",
		"Tarjeta tres",
		"Tarjeta cuatro",
		"Tarjeta cinco",
		"Tarjeta seis"
	];
	
	var availableMetrics = document.getElementById("lista");
	
	for (var i = 0; i < data.length; i++) {
		var liElement = document.createElement("li");
		liElement.appendChild(document.createTextNode(data[i]));
		availableMetrics.appendChild(liElement);
		var liElementDraggable = new Draggable(liElement);
	}
	
	var availableMetricsDroppable = new Droppable(availableMetrics, function(draggable) {
		if (this.element !== draggable.element.parentNode) {
			this.element.appendChild(draggable.element);
		}
	});
	
	var selectedMetricsDroppable = new Droppable("otra_li", function(draggable) {
		if (this.element.parentNode !== draggable.element.parentNode) {
			this.element.parentNode.insertBefore(draggable.element, this.element);
		}
	});

};