// some globals
var gl;
var delay = 100;
var direction = true;
var program;

//Points
var pointBuffer;
var colorPointBuffer;
var pointsArray = []; 
var colorPointsArray = []; 

//Lines
var lineBuffer;
var colorLineBuffer;
var linesArray = []; 
var colorLinesArray = []; 

//drawn line
var drawLineBuffer;
var drawColorBuffer;
var drawLineArray = [];
var colorDrawLine = [];

var offset = 0;
var colorOffset = 0;
var offset2 = 0;
var colorOffset2 = 0;

var tL = {x: 0, y: 200}
var tR = {x: 200, y: 200}
var bL = {x: 0, y: 0}
var bR = {x: 200, y: 0}

var drawLine = false;
var drawTri= false;
var isMouseDown = false;

var index = 0;
var clicks = 0;
var width = 0.0;
var height = 0.0;

var QuadRect = function(left, top, right, bottom){
	this.left = left;
	this.top = top;
	this.right = right;
	this.bottom = bottom;
};

var QuadNode = function() {
	this.rect = null
	this.data = null;
	this.children = null;
};

var QuadTree = function() {
	this.root = new QuadNode();
	this.depth = 0;
}

var tree = new QuadTree();

function quadTreeBuild(depth, rect){
	console.log("starting build")
	tree.depth = depth;

	quadCreateBranch(tree.root, depth, rect);
	console.log("tree finished")
}

function quadCreateBranch(node, depth, rect){
	console.log("branch " + index);
	index++
	if(depth !== 1){
		console.log(rect);
		node.rect = rect;
		node.children = [new QuadNode(), new QuadNode(), new QuadNode(), new QuadNode()];
		childrenRect = rectSubdivide(rect);
		quadCreateBranch(node.children[0], depth - 1, childrenRect[0]);
		quadCreateBranch(node.children[1], depth - 1, childrenRect[1]);
		quadCreateBranch(node.children[2], depth - 1, childrenRect[2]);
		quadCreateBranch(node.children[3], depth - 1, childrenRect[3]);
	}
}

function rectSubdivide(rect){
	console.log("subdivide")
	var firstRect = new QuadRect(
		(rect.left + rect.right)/2, rect.top, rect.right, (rect.top + rect.bottom)/2
	);
	var secondRect = new QuadRect(
		rect.left, rect.top, (rect.left + rect.right)/2, (rect.top + rect.bottom)/2
	);
	var thirdRect = new QuadRect(
		rect.left, (rect.top + rect.bottom)/2, (rect.left + rect.right)/2, rect.bottom
	);
	var fourthRect = new QuadRect(
		(rect.left + rect.right)/2, (rect.top + rect.bottom)/2, rect.right, rect.bottom
	);
	console.log("finished subdivides")
	return [firstRect, secondRect, thirdRect, fourthRect]
}

var rect = new QuadRect(-1,1,1,-1);

window.onload = function init() {
	// get the canvas handle from the document's DOM
    var canvas = document.getElementById( "gl-canvas" );
	height = canvas.height
	width = canvas.width
	// initialize webgl
    gl = WebGLUtils.setupWebGL(canvas);

	// check for errors
    if ( !gl ) { 
		alert("WebGL isn't available"); 
	}

    // set up a viewing surface to display your image
    gl.viewport(0, 0, canvas.width, canvas.height);

	// clear the display with a background color 
	// specified as R,G,B triplet in 0-1.0 range
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    //  Load shaders -- all work done in init_shaders.js
    program = initShaders(gl, "vertex-shader", "fragment-shader");

	// make this the current shader program
    gl.useProgram(program);

	// Get a handle to theta  - this is a uniform variable defined 
	// by the user in the vertex shader, the second parameter should match
	// exactly the name of the shader variable
    thetaLoc = gl.getUniformLocation(program, "theta");

	colorLoc = gl.getUniformLocation(program, "vertColor");

	//POINTS
	pointBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (16*60000), gl.STATIC_DRAW)

	colorPointBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorPointBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, (32*60000), gl.STATIC_DRAW)

	//LINES
	lineBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (16*60000), gl.STATIC_DRAW)

	colorLineBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorLineBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, (32*60000), gl.STATIC_DRAW)

	// Draw Line
	drawLineBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, drawLineBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (16*60000), gl.STATIC_DRAW)

	drawColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, drawColorBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, (32*60000), gl.STATIC_DRAW)

	drawRandomPoints();
	//quadTreeBuild(5, rect);
	render();
};

function render() {
	// this is render loop
	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );

	
	gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointsArray));
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	gl.bindBuffer(gl.ARRAY_BUFFER, colorPointBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorPointsArray));
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0,0);
	gl.enableVertexAttribArray(vColor)
	//Points
	gl.drawArrays(gl.POINTS, 0, 150);

	//Lines
	//gl.drawArrays(gl.LINES, 0, 10000)


	gl.bindBuffer(gl.ARRAY_BUFFER, drawLineBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(drawLineArray));
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	gl.bindBuffer(gl.ARRAY_BUFFER, drawColorBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorDrawLine));
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0,0);
	gl.enableVertexAttribArray(vColor)

	gl.drawArrays(gl.LINES, 0, 2)


	//Time
    setTimeout(
        function () { requestAnimFrame(render) }, delay
    );
}

function drawRandomPoints() {
	for(let i = 0; i < 100; i++){
		var x = (Math.random() * (1.0 - -1.0) + -1.0);
		var y = (Math.random() * (1.0 - -1.0) + -1.0);
		pointsArray.push([x,y]);
		colorPointsArray.push([255,0,0,1]);
	}
	for(let i = 0; i < 50; i++){
		var x = Math.random();
		var y = Math.random();
		pointsArray.push([x,y]);
		colorPointsArray.push([255,0,0,1]);
	}
}

tempx = 0;
tempy = 0;
function onClick(event){
	x = event.clientX;
	y = event.clientY;
	clicks++;

	myVec = deviceToWorld(x,height-y,0);
	myVec2 = worldToNDC(myVec[0], myVec[1], myVec[2]);
	if(clicks % 2 != 0){
		drawLineArray = [];
		colorDrawLine = [];
		tempx = myVec2[0]
		tempy = myVec2[1];
	} else if (clicks % 2 == 0 && clicks <= 2){
		drawLineArray.push([tempx, tempy]);
		colorDrawLine.push([1,1,1,1]);
		drawLineArray.push([myVec2[0], myVec2[1]]);
		colorDrawLine.push([1,1,1,1]);
		clicks = 0;
	}
}

function translate2D(tx,ty,tz){
	translation = mat4(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1)
	return translation 
}

function scale2D(sx,sy,sz){
	scale = mat4(
		sx, 0, 0, 0,
		0, sy, 0, 0,
		0, 0, sz, 0,
		0, 0, 0,  1,
	)
	return scale
}

function dotProd(v1, v2){

	sum = 0.0
	if(v1.length != v2.length){
		throw "dotProd: vectors are not the same dimension"
	}

	for(let i = 0; i < v1.length; i++){
		sum += v1[i] * v2[i]
	}

	return sum
}

function deviceToWorld(x, y, z) {
	myVec = vec4(x, y, z, 1)
	tMat = translate2D(-8,-8, 0)

	x1 = dotProd(tMat[0], myVec)
	y1 = dotProd(tMat[1], myVec)

	myVec2 = vec4(x1,y1, 0, 1)
	sMat = scale2D(1/512, 1/512, 0)

	x2 = dotProd(sMat[0], myVec2)
	y2 = dotProd(sMat[1], myVec2)

	myVec3 = vec4(x2, y2, 0, 1)
	sMat2 = scale2D(200,200, 0)

	x3 = dotProd(sMat2[0], myVec3)
	y3 = dotProd(sMat2[1], myVec3)

	myVec4 = vec4(x3, y3, 0, 1)
	tMat2 = translate2D(-100, -100, 0)

	x4 = dotProd(tMat2[0], myVec4)
	y4 = dotProd(tMat2[1], myVec4)

	returnVec = vec4(x4, y4, 0, 1)

	return returnVec
}

function worldToNDC(wx, wy, wz){
	myVec = vec4(wx, wy, wz, 1)
	sMat = scale2D(1/100, 1/100, 0)

	xDot = dotProd(sMat[0], myVec)
	yDot = dotProd(sMat[1], myVec)

	returnVec = vec4(xDot, yDot, 0, 1)
	return returnVec
}
