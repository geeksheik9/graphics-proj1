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

var lineCount = 0;
var triCount = 0;
var selectedColor = [1, 1, 1, 1];
var selectedColor2 = [1, 0, 0, 1];

var index = 0;

var width = 0.0;
var height = 0.0;
var button = "On"

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

	drawRandomPoints();
	quadTreeBuild(5, rect);
	render();
};

function render() {
	// this is render loop
	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );

	//Points
	gl.drawArrays(gl.POINTS, 0, 4);

	//Lines
	//gl.drawArrays(gl.LINES, 0, 10000)

	//Time
    setTimeout(
        function () { requestAnimFrame(render) }, delay
    );
}

function drawRandomPoints() {
	pointsArray.push([0.25, 0.5]);
	pointsArray.push([0.35, 0.5]);
	pointsArray.push([0.75, 0.25]);
	pointsArray.push([0.65, 0.25]);

	pointsArray.push([0.25, -0.5]);
	pointsArray.push([0.35, -0.5]);
	pointsArray.push([0.75, -0.25]);
	pointsArray.push([0.65, -0.25]);

	pointsArray.push([-0.25, -0.5]);
	pointsArray.push([-0.35, -0.5]);
	pointsArray.push([-0.75, -0.25]);
	pointsArray.push([-0.65, -0.25]);

	pointsArray.push([-0.25, 0.5]);
	pointsArray.push([-0.35, 0.5]);
	pointsArray.push([-0.75, 0.25]);
	pointsArray.push([-0.65, 0.25]);

	gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, offset, flatten(pointsArray));
	offset += 8;
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
}
