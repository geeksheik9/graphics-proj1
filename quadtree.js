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

//intersection points
var intersectionBuffer;
var colorIntersectionBuffer;
var intersectionPoints = [];
var colorInterSectionPoints = [];

var offset = 0;
var colorOffset = 0;
var offset2 = 0;
var colorOffset2 = 0;

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

var points = [
    {x: -0.55, y: 0.65}, 
    {x: -0.55, y: 0.55}, 
	{x: 0.55, y: 0.85},
	{x: 0.65, y: 0.85},
	{x: 0.55, y: 0.90},
	{x: 0.65, y: 0.90},
	{x: 0.55, y: 0.95},
	{x: 0.65, y: 0.95},
]

function quadTreeBuild(depth, rect){
	quadCreateBranch(tree.root, depth, rect);
}

function quadCreateBranch(node, depth, rect){
	for (var i = 0; i < points.length; i++) {
    if (points[i].x < rect.right.x && points[i].x > rect.left.x) {
        if (points[i].y < rect.top.y && points[i].y > rect.bottom.y) {
            linesArray.push([rect.top.x, rect.top.y]);
	        linesArray.push([rect.bottom.x, rect.bottom.y]);

	        linesArray.push([rect.left.x, rect.left.y]);
	        linesArray.push([rect.right.x, rect.right.y]);
	        colorLinesArray.push([1, 1, 1, 1]);

            node.rect = rect;
		    node.children = [new QuadNode(), new QuadNode(), new QuadNode(), new QuadNode()];
		    childrenRect = rectSubdivide(rect);
		    quadCreateBranch(node.children[0], depth - 1, childrenRect[0]);
		    quadCreateBranch(node.children[1], depth - 1, childrenRect[1]);
		    quadCreateBranch(node.children[2], depth - 1, childrenRect[2]);
			quadCreateBranch(node.children[3], depth - 1, childrenRect[3]);
       		}
    	}
	}
}

function rectSubdivide(rect){
    var mid = {x: (rect.left.x + rect.right.x)/2, y:(rect.top.y + rect.bottom.y)/2}
    var tL = {x: rect.left.x, y: rect.top.y}
    var tR = {x: rect.right.x, y: rect.top.y}
    var bL = {x: rect.left.x, y: rect.bottom.y}
    var bR = {x: rect.right.x, y: rect.bottom.y}

	var firstRect = new QuadRect(
        {x: mid.x, y: (rect.top.y + mid.y)/2}, 
        {x: (rect.top.x + tR.x)/2, y: tR.y}, 
        {x: rect.right.x, y: (rect.right.y + tR.y)/2}, 
        {x: (rect.bottom.x + bR.x)/2, y: rect.right.y}
	);
	var secondRect = new QuadRect(
		{x: rect.left.x, y: (rect.left.y + tL.y)/2}, 
        {x: (rect.top.x + tL.x)/2, y: tL.y}, 
        {x: mid.x, y: (rect.left.y + tL.y)/2}, 
        {x: (rect.bottom.x + bL.x)/2, y: rect.left.y}
	);
	var thirdRect = new QuadRect(
		rect.left, (rect.top + rect.bottom)/2, (rect.left + rect.right)/2, rect.bottom
	);
	var fourthRect = new QuadRect(
		(rect.left + rect.right)/2, (rect.top + rect.bottom)/2, rect.right, rect.bottom
	);
	return [firstRect, secondRect, thirdRect, fourthRect]
}

var rect = new QuadRect({x: -1, y: 0}, {x: 0, y: 1}, {x: 1, y: 0}, {x: 0, y: -1});


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
	gl.bindBuffer(gl.ARRAY_BUFFER, drawColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (32*60000), gl.STATIC_DRAW);

	intersectionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, intersectionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (16*60000), gl.STATIC_DRAW);

	colorIntersectionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorIntersectionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (32*60000), gl.STATIC_DRAW);
	
	drawRandomPoints();
	quadTreeBuild(1, rect);
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
	gl.drawArrays(gl.POINTS, 0, 10000);

	//Lines
	gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer)
	gl.bufferSubData(gl.ARRAY_BUFFER, offset2, flatten(linesArray))
	offset2 += 16
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	gl.bindBuffer(gl.ARRAY_BUFFER, colorLineBuffer)
	gl.bufferSubData(gl.ARRAY_BUFFER, colorOffset2, flatten(colorLinesArray))
	colorOffset2 += 16
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0 , 0);
	gl.enableVertexAttribArray(vColor) 

	gl.drawArrays(gl.LINES, 0, 10000)

	//UserDefinedLine
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

	gl.drawArrays(gl.LINES, 0, drawLineArray.length)

	//Intersection points
	gl.bindBuffer(gl.ARRAY_BUFFER, intersectionBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(intersectionPoints));
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	gl.bindBuffer(gl.ARRAY_BUFFER, colorIntersectionBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorInterSectionPoints));
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0,0);
	gl.enableVertexAttribArray(vColor)

	gl.drawArrays(gl.POINTS, 0, intersectionPoints.length);

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

	intersectionPoints = [];
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
		for(let i = 0; i < linesArray.length; i+=2){
			var point = checkIntersection(drawLineArray[0], drawLineArray[1], linesArray[i], linesArray[i+1]);
			if(point.x !== 100 && point.y !== 100){
				intersectionPoints.push([point.x, point.y]);
				colorInterSectionPoints.push([0,0,1,1]);
			}
		}

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

function checkIntersection(p1, p2, p3, p4) {
	var d1 = (p1[0] - p2[0]) * (p3[1] - p4[1]);
	var d2 = (p1[1] - p2[1]) * (p3[0] - p4[0]);
	var d = d1 - d2;

	var u1 = (p1[0] * p2[1] - p1[1] * p2[0]);
	var u4 = (p3[0] * p4[1] - p3[1] * p4[0]);

	var u2x = p3[0] - p4[0];
	var u3x = p1[0] - p2[0];

	var u2y = p3[1] - p4[1];
  	var u3y = p1[1] - p2[1];
	
	var px = (u1 * u2x - u3x * u4) / d;
	var py = (u1 * u2y - u3y * u4) / d;
	
	if(p1[0] > p2[0]){
		if(!px.between(p1[0], p2[0])){
			px = 100;
		}
	}	
	if(p1[0] < p2[0]){
		if(!px.between(p2[0], p1[0])){
			px = 100;
		}
	}

	if(p1[1] > p2[1]){
		if(!py.between(p1[1], p2[1])){
			py = 100
		}
	}

	if(p1[1] < p2[1]){
		if(!py.between(p2[1], p1[1])){
			py = 100
		}
	}

	if(px < p3[0]){
		px = 100;
		py = 100;
	}

	if(py < p4[1]){
		px = 100;
		py = 100;
	}

	if(px == -0) {
		px = 0
	}
	if(py == -0){
		py = 0;
	}

	var p = { x: px, y: py };

	return p;
}

Number.prototype.between = function(a,b){
	var min = Math.min.apply(Math, [a,b]),
	max = Math.max.apply(Math, [a,b]);
	return this > min && this < max;
}