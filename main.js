const saveMAX=120;
var dummy;
var save=[];
var savepos=0;
var saveNum=0;
var cvs;
var cvsW;
var cvsH;
var ctx;
var pt=[0,0];
var ppt=[0,0];
var pppt=[0,0];
var pressure;
var ppressure;
var pen = false;

function reload(){

;
}
function numcalc(){
	xx = dgEBI('pX').value - dgEBI('fX').value;
	yy = dgEBI('pX').value - dgEBI('fY').value;
	zz = dgEBI('pX').value - dgEBI('fX').value;
	dis = Math.sqrt(xx*xx + yy*yy + zz*zz);
	dgEBI('rdD').value = dgEBI('dD').value = dis;
;
}

function dispressure( e ){
	dgEBI("pressure").value = pressure;
	dgEBI("posx").value = pt[0];
	dgEBI("posy").value = pt[1];
}

function pos(e){
	var res=[-1,-1];
	if (pen){
		res = [ e.touches[0].pageX, e.touches[0].pageY];
	}
	else {
		res = [e.pageX, e.pageY];
	}
	return res;
}

function lineMake( e ){
	if(pen){
		ppressure = pressure;
		pressure = e.touches[0].force;
		//ctx.globalAlpha =  dgEBI('vA').value*.01;
		ctx.lineWidth	= dgEBI('vSIZE').value * pressure*(1.9-pressure );
		ctx.filter = "opacity("+dgEBI('vA').value+"%)blur(1px)";
	}else{
		pressure = 1;
		ctx.filter = "opacity("+dgEBI('vA').value+"%)blur(1px)";
		//ctx.globalAlpha = dgEBI('vA').value*.01;
		ctx.lineWidth	= dgEBI('vSIZE').value;
	}
	ctx.lineTo( pt[0], pt[1] );
	//ctx.quadraticCurveTo( .5*(pt[0]+ppt[0])+(ppt[0]-pppt[0])*.25, .5*(pt[1]+ppt[1])+(ppt[1]-pppt[1])*.25,  pt[0], pt[1] );
	ctx.stroke();
}

function onTouchStart( e ){
	pt = pos(e);
	ppt = pt;
	pppt = pt;
	ctx.lineCap = "round";
	ctx.lineJoin	= "round";

	ctx.strokeStyle = dgEBI("color1").value;
	ctx.beginPath();
	pen = false;
	if (window.TouchEvent && e.touches){ pen = true;}
	ctx.moveTo( pt[0], pt[1] );
	ctx.lineTo( pt[0], pt[1] );
	lineMake(e);
	if (pen){
		cvs.addEventListener( "touchmove", onTouchMove, false);
		cvs.addEventListener( "touchend", onTouchEnd, false);
	} else{
		cvs.addEventListener( "mousemove", onTouchMove, false);
		cvs.addEventListener( "mouseup", onTouchEnd, false);
	}
}

function onTouchMove( e ){
	e.preventDefault();
	pppt = ppt;
	ppt = pt;
	pt = pos(e);
	dispressure(e);
	//ctx.beginPath();
	//ctx.globalCompositeOperation = "destination-out";//"";
	//ctx.filter = "opacity(50%)blur(2px)";
	//ctx.moveTo( ppt[0], ppt[1] );
	//ctx.lineTo( ppt[0], ppt[1] );
	//ctx.quadraticCurveTo( .5*(pt[0]+ppt[0])+(ppt[0]-pppt[0])*.5, .5*(pt[1]+ppt[1])+(ppt[1]-pppt[1])*.5,  pt[0], pt[1] );
	//ctx.stroke();

	//ctx.beginPath();
	ctx.moveTo( ppt[0], ppt[1] );
	ctx.lineTo( ppt[0], ppt[1] );

	ctx.globalCompositeOperation = "destination-over";
	lineMake(e);
	if (pen){
		cvs.addEventListener( "touchmove", onTouchMove, false);
		cvs.addEventListener( "touchend", onTouchEnd, false);
	} else{
		cvs.addEventListener( "mousemove", onTouchMove, false);
		cvs.addEventListener( "mouseup", onTouchEnd, false);
	}
}

function onTouchEnd( e ){
	dispressure(e);
	pppt = ppt;
	ppt = pt;
	pt = pos(e);
	cvs.removeEventListener( "touchmove", onTouchMove );
	cvs.removeEventListener( "touchend", onTouchMove );
	cvs.removeEventListener( "mousemove", onTouchMove );
	cvs.removeEventListener( "mouseup", onTouchEnd );
	pen = false;
	if (window.TouchEvent && e.touches){ pen = true;}

	ctx.beginPath();
	ctx.moveTo( ppt[0], ppt[1] );
	ppressure = pressure = 0;
	lineMake(e);

	dgEBI("pressure").value = "-";
	dgEBI("posx").value = "-";
	dgEBI("posy").value = "-";
	e.preventDefault();
	cvs.addEventListener( "mousedown", onTouchStart, false);
	cvs.addEventListener( "touchstart", onTouchStart, false);
	register();
}
function unredoDiv(){
	if( savepos == 1 ){		dgEBI("undo").setAttribute("disabled", "disabled");}
	else{					dgEBI("undo").removeAttribute("disabled");}
	if( savepos == saveNum){	dgEBI("redo").setAttribute("disabled", "disabled");}
	else{					dgEBI("redo").removeAttribute("disabled");}
	dgEBI("history").value = savepos;
	dgEBI("history").max = saveNum;
	dgEBI("history1").value = savepos;
	dgEBI("history2").value = saveNum;
}
function register(pos){
	if(pos>0){savepos=pos;}
	console.log("register: "+pos);
	if( savepos == saveNum){
		save.push(ctx.getImageData(0, 0, cvsW, cvsH));
	}else{
		save.splice(savepos,saveNum-savepos);
		save.push(ctx.getImageData(0, 0, cvsW, cvsH));
		saveNum = savepos;
	}
	console.log("saved to " + savepos);

	if( saveNum > saveMAX ) {
		save.shift();
	}else{
		savepos++;
		saveNum++;
	}
	unredoDiv();
	//[savepos,saveNum]
}
function undo(pos) {
	
	setupcanvas();
	ctx.putImageData(save[savepos-2], 0, 0);savepos--;
	console.log("undo: loded to "+savepos+"/"+saveNum);
	unredoDiv();
}
function redo() {
	setupcanvas();
	ctx.putImageData(save[savepos], 0, 0); savepos++;
	console.log("redo: loded to "+savepos+"/"+saveNum);
	unredoDiv();
}

function inkey(e) {
	if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
		undo();
	}
	if (event.key === 'y' && (event.ctrlKey || event.metaKey)) {
		redo();
	}
}

function setQuality(value){
	dummy.setAttribute("width", 320 * value);
	dummy.setAttribute("height",180 * value);
	cvs.setAttribute("width", 320 * value);
	cvs.setAttribute("height",180 * value);
	ctx.scale( 1, 1);
	
	cvsW = 320 * value;
	cvsH = 180 * value;
}

function setupcanvas(){
	dummy = dgEBI("dummy");
	dummy.innerHTML = '<canvas id="canvas"> </canvas>';

	cvs = dgEBI("canvas");
	cvs.addEventListener( "mousedown", onTouchStart, false);
	cvs.addEventListener( "touchstart", onTouchStart, false);
	ctx = cvs.getContext( "2d" );
	setQuality(dgEBI("CNVsize").value);
}

window.onload	= function(){
	setupcanvas();
	numcalc();
	//register();
	//colorC();
	addEventListener('keydown',inkey());
/*
var cube_center = new Vertex(0, 11*dy/10, 0);
    var dx = cvs.width / 2;
    var dy = cvs.height / 2;
    ctx.strokeStyle = 'rgba(0, 0, 0, .5)';
    ctx.fillStyle = 'rgba(0, 150, 255, .5)';
    var cube = new Cube(cube_center, dy);
    var objects = [cube];

    // First render
    render(objects, ctx, dx, dy);
ctx.lineCap = "round";
ctx.fillStyle = 'blue';
ctx.fillRect(10, 10, 20, 20);

ctx.fillStyle = 'red';
ctx.fillRect(90, 60, 20, 20);

ctx.beginPath();
ctx.moveTo(20, 20);
ctx.lineTo(20,100);
ctx.lineTo(100,70);
ctx.stroke();  
    cvs.width = cvs.offsetWidth;
    cvs.height = cvs.offsetHeight;
    var dx = cvs.width / 2;
    var dy = cvs.height / 2;

    // Objects style
    ctx.strokeStyle = 'rgba(0, 0, 0, .5)';
    ctx.fillStyle = 'rgba(0, 150, 255, .5)';

    // Create the cube
    var cube_center = new Vertex(0, 11*dy/10, 0);
    var cube = new Cube(cube_center, dy);
    var objects = [cube];

    // First render
    render(objects, ctx, dx, dy);

    // Events
    var mousedown = false;
    var mx = 0;
    var my = 0;

    cvs.addEventListener('mousedown', initMove);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', stopMove);

    // Rotate a vertice
    function rotate(M, center, theta, phi) {
        // Rotation matrix coefficients
        var ct = Math.cos(theta);
        var st = Math.sin(theta);
        var cp = Math.cos(phi);
        var sp = Math.sin(phi);

        // Rotation
        var x = M.x - center.x;
        var y = M.y - center.y;
        var z = M.z - center.z;

        M.x = ct * x - st * cp * y + st * sp * z + center.x;
        M.y = st * x + ct * cp * y - ct * sp * z + center.y;
        M.z = sp * y + cp * z + center.z;
    }

    // Initialize the movement
    function initMove(evt) {
        //clearTimeout(autorotate_timeout);
        mousedown = true;
        mx = evt.clientX;
        my = evt.clientY;
    }

    function move(evt) {
        if (mousedown) {
            var theta = (evt.clientX - mx) * Math.PI / 360;
            var phi = (evt.clientY - my) * Math.PI / 180;

            for (var i = 0; i < 8; ++i)
                rotate(cube.vertices[i], cube_center, theta, phi);

            mx = evt.clientX;
            my = evt.clientY;

            render(objects, ctx, dx, dy);
        }
    }

    function stopMove() {
        mousedown = false;
        //autorotate_timeout = setTimeout(autorotate, 2000);
    }

    function autorotate() {
        for (var i = 0; i < 8; ++i)
            rotate(cube.vertices[i], cube_center, -Math.PI / 720, Math.PI / 720);

        render(objects, ctx, dx, dy);

        autorotate_timeout = setTimeout(autorotate, 30);
    }
    //autorotate_timeout = setTimeout(autorotate, 2000);
*/
}
var Vertex = function(x, y, z) {
    this.x = parseFloat(x);
    this.y = parseFloat(y);
    this.z = parseFloat(z);
}
var Cube = function(center, size) {
    // Generate the vertices
    var d = size / 2;

    this.vertices = [
        new Vertex(center.x - d, center.y - d, center.z + d),
        new Vertex(center.x - d, center.y - d, center.z - d),
        new Vertex(center.x + d, center.y - d, center.z - d),
        new Vertex(center.x + d, center.y - d, center.z + d),
        new Vertex(center.x + d, center.y + d, center.z + d),
        new Vertex(center.x + d, center.y + d, center.z - d),
        new Vertex(center.x - d, center.y + d, center.z - d),
        new Vertex(center.x - d, center.y + d, center.z + d)
    ];

    // Generate the faces
    this.faces = [
        [this.vertices[0], this.vertices[1], this.vertices[2], this.vertices[3]],
        [this.vertices[3], this.vertices[2], this.vertices[5], this.vertices[4]],
        [this.vertices[4], this.vertices[5], this.vertices[6], this.vertices[7]],
        [this.vertices[7], this.vertices[6], this.vertices[1], this.vertices[0]],
        [this.vertices[7], this.vertices[0], this.vertices[3], this.vertices[4]],
        [this.vertices[1], this.vertices[6], this.vertices[5], this.vertices[2]]
    ];
}
var cube = new Cube(new Vertex(10, 10, 10), 200);
function render(objects, ctx, dx, dy) {
    // For each object
    for (var i = 0, n_obj = objects.length; i < n_obj; ++i) {
        // For each face
        for (var j = 0, n_faces = objects[i].faces.length; j < n_faces; ++j) {
            // Current face
            var face = objects[i].faces[j];

            // Draw the first vertex
            var P = project(face[0]);
            ctx.beginPath();
            ctx.moveTo(P.x + dx, -P.y + dy);

            // Draw the other vertices
            for (var k = 1, n_vertices = face.length; k < n_vertices; ++k) {
                P = project(face[k]);
                ctx.lineTo(P.x + dx, -P.y + dy);
            }

            // Close the path and draw the face
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
    }
}
var Vertex2D = function(x, y) {
    this.x = parseFloat(x);
    this.y = parseFloat(y);
}
function project(M) {
    return new Vertex2D(M.x, M.y);
}

function dgEBI(a){
	return document.getElementById(a);
}
function dgEBT(a){
	return document.getElementsByTagName(a);
}
function dgEBC(a){
	return document.getElementsByClassName(a);
}
function colorV() {
    dgEBI("color1").value = dgEBI("color2").value;
}
function colorC() {
    dgEBI("color2").value = dgEBI("color1").value.toUpperCase();
}

function colorRGB() {
	RGB = "#" + toHex(1*dgEBI("vR").value) + toHex(1*dgEBI("vG").value) + toHex(1*dgEBI("vB").value);
	dgEBI("color1").value = dgEBI("color2").value = RGB;
}

function toHex ( v ) {
	return  ("0"+v.toString( 16 ).toUpperCase()).slice( -2 ) ;
}