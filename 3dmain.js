const saveMAX=120;
const ax0=0.0000000000001;
const axx=300000;
const PI2=Math.PI*2;
const PI=Math.PI;
const PIh=Math.PI*.5;
const rt2=Math.sqrt(2);
const rt2h=Math.sqrt(2)/2;
const moveAU = PI/180;
const movePU = 0.1;

var reduct = 0.0;
var FPS = 30;
var thickMAX = 50;
var NF2 = /-?\d+[.]?[\d]{0,2}/;
var save=[];
var savepos=0;
var saveNum=0;

var dummy;
var cvs;
var ctx;
var dist=10;

var pt=[0,0];
var ppt=[0,0];
var pppt=[0,0];
var pressure;
var ppressure;
var pen = false;
var defaultV = {"ca":new Vertex(0,0,0), "cp":new Vertex(0,1.5,-1), "fp":new Vertex(0,0,0), "av":new Vertex(180,0,0)};
var angR = 720;
var speedR = new Vertex(0,0,0);
var speed = new Vertex(0,0,0);
var cameraA = new Vertex(0,0,0);
var cameraAr = new Vertex(0,0,0);
var cameraP = new Vertex(0,0,0);
var focusP = new Vertex(0,0,0);
var AngleView = new Vertex(0,0,0);
var sinCA = new Vertex(0,0,0);
var cosCA = new Vertex(0,0,0);
var point=[];
//*--------------------------------------------------------------------------------------------------------------------
//												tool
function sinK(x){// 8 digit, 6.105e-8 s
	sign=1;xd=x%PI2;if(xd<0){sign*=-1;xd=-xd;}
	if(xd%PI!=xd){sign*=-1;xd-=PI;}
	if(xd%PIh!=xd){if(xd<0){sign*=-1;xd=-xd;}xd=PIh-xd%PIh;}xx=xd*xd;
	return (sign*xd*(1-xx*(1-xx*(1-xx*(1-xx*(1-xx*(1-xx/156)/110)/72)/42)/20)/6));
}
function cosK(x){// 8 digit, 6.041e-8 s
	sign=1;xd=(x<0?-x:x)%PI2;if(xd%PI!=xd){sign*=-1;xd=Math.abs(xd-PI);}
	if(xd%PIh!=xd){sign*=-1;xd-=PI;}xx=xd*xd;
	return (sign*(1-xx*(1-xx*(1-xx*(1-xx*(1-xx*(1-xx/132)/90)/56)/30)/12)/2));
}
function tanK(x){return (x<0?-1:1)*Math.sqrt((1/(cosK(x)**2))-1);}// , 7.046e-8 s
function rad(deg){
	return deg * ( PI / 180.0 );
}
function deg(rad){
	return rad*180.0/PI;
}
function sind(xd){
	return sinK(rad(xd));
}
function cosd(xd){
	return cosK(rad(xd));
}
function asin(xa){
	return deg(asin(xa));
}
function acosd(xa){
	return deg(acos(xa));
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
//*--------------------------------------------------------------------------------------------------------------------
//												Drawing
function pos(e){
	var res=[-1,-1];
	if (pen){
		res = [ e.touches[0].pageX, e.touches[0].pageY];
	}else {
		res = [e.pageX, e.pageY];
	}
	return res;
}
function lineMake( e ){
	ctx.lineTo( pt[0], pt[1] );
	ctx.stroke();
}
function onTouchStart( e ){
	console.log(e.Button);
	
	e.preventDefault();
	pt = pos(e);
	ppt = pt;
	cvs.addEventListener( "mousemove", onTouchMove, false);
}
function onTouchMove( e ){
	ppt = pt;
	pt = pos(e);
	switch (e.which) {
    case 1:
		speedR.x +=.002*(pt[1] - ppt[1]);
		speedR.y -=.002*(pt[0] - ppt[0]);
	addV(cameraA, speedR);
        break;
    case 2:
		speed.x -=.002*(pt[0] - ppt[0]);
		speed.y +=.002*(pt[1] - ppt[1]);
	addV(cameraP, speed);
        break;
    case 3:
        console.log('!! Right !!');
        break;
    default:
    }
	cvs.addEventListener( "mousemove", onTouchMove, false);
	cvs.addEventListener( "mouseup", onTouchEnd, false);
}
function onTouchEnd( e ){
	addV(cameraP, speed);
	e.preventDefault();
	cvs.removeEventListener( "mousemove", onTouchMove, false);
	cvs.addEventListener( "mousedown", onTouchStart, false);
	numcalc();
	reload();
}
function onwheel( e ){
	e.preventDefault();
	if(e.deltaY){
		addV(cameraP,angle(0, 0, 0.002*e.deltaY));
		inputCameraPos();
	}
	numcalc();
	reload();
}
//*--------------------------------------------------------------------------------------------------------------------
//												Save load
function saveCanvas(){
	var a = document.createElement('a');
	a.href = cvs.toDataURL();
	a.download = "c"+-dgEBI('cpZ').value+'mm.png';
	a.click();
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
		save.push(ctx.getImageData(0, 0, cvs.width, cvs.height));
	}else{
		save.splice(savepos,saveNum-savepos);
		save.push(ctx.getImageData(0, 0, cvs.width, cvs.height));
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
//*--------------------------------------------------------------------------------------------------------------------
//												Canvas		
//*--------------------------------------------------------------------------------------------------------------------
function setQuality(value){
	dummy.setAttribute("width", 320 * value);
	dummy.setAttribute("height",320 * value);
	cvs.setAttribute("width", 320 * value);
	cvs.setAttribute("height",320 * value);
	angR = 92*value;
	ctx.scale( 1, 1);
	
}
function setupcanvas(){
	dummy = dgEBI("dummy");
	dummy.innerHTML = '<canvas id="canvas"> </canvas>';

	cvs = dgEBI("canvas");
	ctx = cvs.getContext( "2d" );
	setQuality(dgEBI("CNVsize").value);
	cvs.addEventListener( "mousedown", onTouchStart, false);
	cvs.addEventListener( "mousewheel", onwheel, false);
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
}
//*--------------------------------------------------------------------------------------------------------------------
//											System Display
function multipleV(A,d){
	A.x *= d;
	A.y *= d;
	A.z *= d;
}
function addV(A,B){
	A.x += B.x;
	A.y += B.y;
	A.z += B.z;
}
function angleV(V){
	xx = ( V.x*cosCA.y + V.z*sinCA.y ) ;
	yy = ( V.y*cosCA.x + -V.z*sinCA.x ) ;
	zz = ( V.y*cosCA.y*sinCA.x + V.z*cosCA.y*cosCA.x+ V.z*sinCA.y ) ;
	return new Vertex(xx,yy,zz);
}
function angle(x, y, z){
	xx = ( x*cosCA.y + z*sinCA.y ) ;
	yy = ( y*cosCA.x + -z*sinCA.x ) ;
	zz = ( y*cosCA.y*cosCA.x + z*cosCA.y*cosCA.x+ z*sinCA.y ) ;
	return new Vertex(xx,yy,zz);
}
setValue =function (A,B){
	dgEBI(B+'X').value = (""+A.x).match(NF2);
	dgEBI(B+"Y").value = (""+A.y).match(NF2);
	dgEBI(B+"Z").value = (""+A.z).match(NF2);
};
setValueR =function (A,B){
	dgEBI(B+'X').value = (""+A.x);
	dgEBI(B+"Y").value = (""+A.y);
	dgEBI(B+"Z").value = (""+A.z);
};
setValueDeg =function (A,C){
	dgEBI(C+'X').value = (""+deg(A.x)).match(NF2);
	dgEBI(C+"Y").value = (""+deg(A.y)).match(NF2);
	dgEBI(C+"Z").value = (""+deg(A.z)).match(NF2);
};
function inputCameraAngle(){
	if(Math.abs(cameraA.x) >= 1.57 ){cameraA.x -= Math.sign(cameraA.x)*PI;}
	if(Math.abs(cameraA.y) >= 3.14 ){cameraA.y -= Math.sign(cameraA.y)*PI2;} 
	if(Math.abs(cameraA.z) >= 3.15 ){cameraA.z -= Math.sign(cameraA.z)*PI2;} 
	setValueR(cameraA,'rca');
	setValueDeg(cameraA,'ca')
}
function inputCameraPos(){
	if(Math.abs(cameraP.x) > 100 ){cameraP.x = 100*Math.sign(cameraP.x);}
	if(Math.abs(cameraP.y) > 100 ){cameraP.y = 100*Math.sign(cameraP.y);} 
	if(Math.abs(cameraP.z) > 100 ){cameraP.z = 100*Math.sign(cameraP.z);} 
	setValueR(cameraP,'rcp');
	setValue(cameraP,'cp');
}
function inputFocusPos(){
	if(Math.abs(focusP.x) >= 100 ){focusP.x = 100*Math.sign(focusP.x);}
	if(Math.abs(focusP.y) >= 100 ){focusP.y = 100*Math.sign(focusP.y);} 
	if(Math.abs(focusP.z) >= 100 ){focusP.z = 100*Math.sign(focusP.z);} 
	setValueR(focusP,'rfp');
	setValue(focusP,'fp');
}
function inputAngleView(){
	if(Math.abs(AngleView.x) >= 180 ){AngleView.x = 180*Math.sign(AngleView.x);}
	if(Math.abs(AngleView.y) >= 1200 ){AngleView.y = 1200*Math.sign(AngleView.y);} 
	if(Math.abs(AngleView.z) >= 100 ){AngleView.z = 100*Math.sign(AngleView.z);} 
	setValueR(AngleView,'rav');
	setValue(AngleView,'av');
}
function inputDistance(dis){
	if(Math.abs(dis) >= 223 ){dis = Math.sign(223);} 
	dgEBI('fdis').value = (""+dis).match(NF2);
	dgEBI('rfdis').value = dis;
}
function dispressure( e ){
	dgEBI("pressure").value = pressure;
	dgEBI("posx").value = pt[0];
	dgEBI("posy").value = pt[1];
}
function inkey(e) {
	if(e.ctrlKey || e.metaKey){
		switch (e.key){
		  case 'z':undo();
			break;
		  case 'y':redo();
			break;
		}
	}else{
		console.log(e.key);
		 switch (e.key){
		  case 'd':			speed.x += movePU;break;
		  case 'a':			speed.x += -movePU; break;
		  case 'r':			speed.y += movePU;break;
		  case 'f':			speed.y += -movePU;break;
		  case 'w':			speed.z += movePU;break;
		  case 's':			speed.z += -movePU; break;
			//水平前翼ピッチ
		  case 'ArrowUp':		speedR.x += -moveAU;break;
		  case 'ArrowDown':	speedR.x += moveAU;break;
			//垂直尾翼ヨー
		  case 'q':			speedR.y += -moveAU*2;break;
		  case 'e':			speedR.y += moveAU*2;break;
			//水平尾翼ロール
		  case 'ArrowLeft':	speedR.z += moveAU;break;
		  case 'ArrowRight':	speedR.z += -moveAU;break
			//thick
		  case '[':			thickMAX += 1;break;
		  case ']':			thickMAX += -1;break
			//thick
		  case '.':			AngleView.z += .1;break
		  case ',':			AngleView.z += -.1;break;
		}
		reload();
	}
}
//*--------------------------------------------------------------------------------------------------------------------
//												3D calc
function Vertex(x,y,z) {
	this.x = parseFloat(x);
	this.y = parseFloat(y);
	this.z = parseFloat(z);
}
function getValue (value) {
	return new Vertex(parseFloat(dgEBI(value+"X").value),parseFloat(dgEBI(value+"Y").value),parseFloat(dgEBI(value+"Z").value));
};
function vector2P(A,B){//Vertex, Vertex
	return new Vertex(B.x - A.x, B.y - A.y, B.z - A.z);
}
function distance2P(A,B){//Vertex, Vertex |A-B|
	x = A.x - B.x;
	y = A.y - B.y;
	z = A.z - B.z;
	return  Math.sqrt(x*x + y*y + z*z);
}
function setDefaltValue(A){
	dgEBI(A+"X").value = defaultV[A].x;
	dgEBI(A+"Y").value = defaultV[A].y;
	dgEBI(A+"Z").value = defaultV[A].z;
	dgEBI("r"+A+"X").value = defaultV[A].x;
	dgEBI("r"+A+"Y").value = defaultV[A].y;
	dgEBI("r"+A+"Z").value = defaultV[A].z;
}
function logDisplayValue(A){
	console.log(A+":"+[dgEBI(A+"X").value, dgEBI(A+"Y").value, dgEBI(A+"Z").value]);
}
function angle2P(A,B){//Vertex, Vertex  (B-A)
	vec = vector2P(A, B); //A=[0,0,0]
	return  new Vertex(Math.atan2(vec.y, vec.z), Math.atan2(vec.x, vec.z), A.z);//仰角、方角、
}
function posPAD(pos, ANGd, dis){
	return new Vertex(
		pos.x + dis * cosK(ANGd.x)*sinK(ANGd.y),
		pos.y + dis * sinK(ANGd.x),
		pos.z + dis * cosK(ANGd.x)*cosK(ANGd.y)
	);
}
function angleMove(S,B){
	return new Vertex(
		S.x*cosK(B.y)*cosK(B.z)	- S.y*cosK(B.x)*sinK(B.z) + S.z*cosK(B.x)*sinK(B.y),
		S.x*sinK(B.z)*cosK(B.y)	+ S.y*cosK(B.x)*cosK(B.z) + S.z*sinK(B.x)*cosK(B.y),
		-S.x*sinK(B.y)*cosK(B.z)	+ S.y*sinK(B.x)*cosK(B.z) + S.z*cosK(B.x)*cosK(B.y)
	);
}
function angleangle(S,B){
	return new Vertex(
		S.x,
		S.y,
		S.z
	);
}
function reload(){
	if(dgEBI('fdisc').checked){//カメラ位置 && 焦点位置 → 焦点距離
		inputDistance(dis+speed.z);
		speed.z=0;
	}
	inputAngleView();
	addV(focusP,angleMove(speed,cameraA));
	inputFocusPos();
	multipleV(speed,reduct);
	numcalc();
	addV(cameraA,angleangle(speedR,focusP))
	inputCameraAngle();
	multipleV(speedR,reduct);
	numcalc();
	
	sinCA = new Vertex(sinK(cameraA.x),sinK(cameraA.y),sinK(cameraA.z));
	cosCA = new Vertex(cosK(cameraA.x),cosK(cameraA.y),cosK(cameraA.z));
	setupcanvas();
	display("cross");
	ctx.stroke();  
}
function display(a){
	
	const path = new Path2D("M0,0h"+cvs.width+"v"+cvs. height+"h-"+cvs.width+"z");
	ctx.fill(path);
	ctx.beginPath();

	//ctx.lineCap = "round";
	ctx.filter = "none";
	//ctx.globalCompositeOperation ="lighter";
	//ctx.filter = "blur(4px)";

	
	point.forEach(function(value){plot(value);});
	ctx.stroke();

	if(a =="cross"){
		ctx.strokeStyle = 'rgba(127, 255, 127, .5)';
		ctx.font = "24px 'ＭＳ ゴシック'";
		ctx.beginPath();
		ctx.lineCap = "round";
		ctx.filter = "none";
		//ctx.moveTo(cvs.width*.5, 0);
		//ctx.lineTo(cvs.width*.5,cvs. height);
		//ctx.moveTo(0, cvs.height*.5);
		//ctx.lineTo(cvs.width,cvs.height*.5);
		ctx.strokeText("Y軸:"+dgEBI('caX').value.match(NF2)+"°",　cvs.width-70,　cvs.height*.5-2);
		ctx.strokeText("X軸:"+dgEBI('caY').value.match(NF2)+"°",　cvs.width*.5+2,　cvs.height-10);
		ctx.arc(cvs.width*.5 , cvs.height*.5, cvs.width*.5, 0, PI2);//X,Y,thick90
		ctx.arc(cvs.width*.5 , cvs.height*.5, cvs.width*.25, 0, PI2);//X,Y,thick45
//hud
		//ctx.moveTo(cvs.width*.5-cosCA.z*cvs.width*.25, cvs.width*.5-sinCA.z*cvs.width*.25);
		//ctx.lineTo(cvs.width*.5+cosCA.z*cvs.width*.25, cvs.width*.5+sinCA.z*cvs.width*.25);
		x1 = cvs.width*.5 - cosCA.z*cvs.width/9;
		x2 = cvs.width*.5 + cosCA.z*cvs.width/9;
		y1 = cvs.width*.5 - sinCA.z*cvs.width/9 + sinCA.x*cvs.width%(cvs.width/18);
		y2 = cvs.width*.5 + sinCA.z*cvs.width/9 + sinCA.x*cvs.width%(cvs.width/18);
		
		for(i=-4;i<5;i++){
			ctx.moveTo(x1  - i*sinCA.z*cvs.width/18,  y1 + i*cosCA.z*cvs.width/18);
			ctx.lineTo(x2  - i*sinCA.z*cvs.width/18,  y2 + i*cosCA.z*cvs.width/18);
			ctx.strokeText(10*((dgEBI('caX').value-dgEBI('caX').value%10)/10-i)+"°",
						　x2  - i*sinCA.z*cvs.width/18,　 y2 + i*cosCA.z*cvs.width/18);
			
		}

		ctx.stroke();
		ctx.strokeText("Z軸:"+dgEBI('caZ').value.match(NF2)+"°",　cvs.width*.75+5,　cvs.height*.5+20);
		
	}
	
}
function transA(A){
	
	dist = distance2P(cameraP, A);
	thick = 1+thickMAX/(1+dist*dist);
	A = affineTrans0(A,cameraA);
	//logpoint("",A,"\n");
	return new Vertex(A.x, A.y,thick);
}

function trans(A){
	dist = distance2P(cameraP, A);
	thick = 1+thickMAX/(1+dist*dist);
	A = rotate(A);	//related pos
	
	A = vector2P(cameraP, A);	//related pos
	/*
	tx = A.x;
	ty = A.y;
	/*/
	tx = A.x*rt2h - A.y*rt2h;
	ty = A.x*rt2h + A.y*rt2h;
	//*/
	tz = A.z;
	if(tz<.1){ thick=0.0;}
	A.x = Math.atan2(ty, tz*((AngleView.z)));
	A.y = Math.atan2(tx, tz*((AngleView.z)));
	/*
	tx = A.x;
	ty = A.y;
	/*/
	tx = A.x*rt2h - A.y*rt2h;
	ty = A.x*rt2h + A.y*rt2h;
	//*/
	A.x = cosCA.z*tx - sinCA.z*ty;
	A.y = sinCA.z*tx + cosCA.z*ty;
		tx = (A.x*A.x)/PI;
		ty = (A.y*A.y)/PI;
		A.x = A.x*(rt2+(-tx*ty));
		A.y = A.y*(rt2+(-tx*ty));
	if( A.x*A.x + A.y*A.y > PI){ thick=0.0;}
		A.z = thick
	//logpoint("",A,"\n");
	return A;
}
function plot(A){
	A = trans(A);
	if(A.z < 1){return;}
	ctx.strokeStyle = 'rgba('+(A.z*100+128)+', '+A.z*255+', 255, .7)';
	//ctx.moveTo(cvs.height*.5 + angR*A.y , cvs.width*.5 - angR*A.x);

	ctx.lineTo(cvs.height*.5 + angR*A.y ,cvs.width*.5 - angR*A.x);//X,Y,thick
	ctx.font = A.z+"px 'ＭＳ ゴシック'";
	ctx.strokeText("Ｏ", cvs.height*.5 + angR*A.y ,cvs.width*.5 - angR*A.x);//X,Y,thick
	//ctx.stroke();  
	//ctx.arc( cvs.height*.5 + angR*A.y ,cvs.width*.5 - angR*A.x, A.z, 0, PI2);//X,Y,thick
	//ctx.fill();
}
function partline(A,B,n){
	ctx.fillStyle = 'rgba(128, 255, 255, .907)';
	A = trans(A);
	B = trans(B);
	ctx.moveTo(cvs.height*.5 + angR*A.y , cvs.width*.5 - angR*A.x);
	for(i=1;i<n;i++){
		ctx.lineTo(cvs.height*.5 + angR*A.y , cvs.width*.5 - angR*A.x);


	}
}
function logpoint(ss1,A,ss2){
	dgEBI('log').value += ss1+"("+(""+(A.x)).match(NF2)+", "+(""+(A.y)).match(NF2)+", "+(""+(A.z)).match(NF2)+ ")"+ss2;
}
var Cube = function(center, size) {//Vertex, num
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
	Vertex.plot =function (weight){
	};
	Vertex.setValue =function (B){
		dgEBI(B+'X').value = parseFloat(x);
		dgEBI(B+"Y").value = parseFloat(y);
		dgEBI(B+"Z").value = parseFloat(z);
	};
}
function project(M) {
    return new Vertex2D(M.x, M.y);
}
function rand(a){
	return 2*Math.random()*a;
}
function affineTrans0(A,D){
	sX = sinK(-D.x);
	sY = sinK(-D.y);
	sZ = sinK(-D.z);
	cX = cosK(-D.x);
	cY = cosK(-D.y);
	cZ = cosK(-D.z);
	return new Vertex(
		A.x*cX + A.y*sY + A.z*sZ
		,
		A.x*sX + A.y*cY + A.z*sZ
		,
		A.x*sX + A.y*sY + A.z*cZ
	);
}
function rotate(A) {
	// Rotation
	var x = A.x - focusP.x;
	var y = A.y - focusP.y;
	var z = A.z - focusP.z;

	return  new Vertex(	focusP.x + x*cosCA.y - y*sinCA.y*cosCA.x + z*sinCA.y*sinCA.x,
						focusP.y + x*sinCA.y + y*cosCA.y*cosCA.x - z*cosCA.y*sinCA.x,
						focusP.z + x*sinCA.y + y*sinCA.x 		 + z*cosCA.x*cosCA.y
			);
	
}
function AVcalc(change){
	switch(change){
	  case 1://X画角
		AngleView.y = 18/Math.tan(PI*AngleView.x/360);
		AngleView.z = 180/AngleView.x-1;
		break;
	  case 2://35mm換算
		AngleView.z = PIh/Math.atan(18/AngleView.y);
		AngleView.x = 360*Math.atan(18/AngleView.y)/PI;
		break;
	  case 3://disN
		AngleView.x = 180/(AngleView.z+1);
		AngleView.y = 18/Math.tan(PIh/(AngleView.z+1));
		break;
	}
	inputAngleView();
}
function numcalc(change){
//CA:カメラ角度
//CP:カメラ位置
//FP:焦点位置
//fd :焦点距離
//av :画角

	cameraP=getValue("cp");
	focusP=getValue("fp");
	cameraA=getValue("rca");
	AngleView=getValue("av");AVcalc(3);	inputAngleView();
	if(thickMAX < 1 ){thickMAX = 1;}
	if(Math.abs(cameraA.x) >= 1.57 ){cameraA.x -= Math.sign(cameraA.x)*PI;}
	if(Math.abs(cameraA.y) >= 3.14 ){cameraA.x -= Math.sign(cameraA.y)*PI2;} 
	if(Math.abs(cameraA.z) >= 3.14 ){cameraA.z -= Math.sign(cameraA.z)*PI2;} 
	dis = dgEBI("fdis").value;
	

	if(dgEBI('CPc').checked){//カメラ角度 && 焦点位置 && 焦点距離 → カメラ位置
		cameraAr = new Vertex(-dgEBI('caX').value, -dgEBI('caY').value, dgEBI('caZ').value);
		cameraP = new posPAD(focusP, cameraAr, dis);
		inputCameraPos( cameraP );
	}

	if(dgEBI('CAc').checked){//カメラ位置 && 焦点位置  → カメラ角度
		cameraA = angle2P(cameraP, focusP);
		inputCameraAngle(cameraA);
	}
	if(dgEBI('FPc').checked){//カメラ位置 && 焦点距離 && カメラ角度 → 焦点位置
		focusPs = new posPAD(cameraP, cameraA, dis);
		inputFocusPos( focusPs );
	}
	if(dgEBI('fdisc').checked){//カメラ位置 && 焦点位置 → 焦点距離
		inputDistance( distance2P(focusP, cameraP));
	}
	if( dgEBI('caZc').checked){
		dgEBI('rcaZ').setAttribute("disabled", "disabled");
		dgEBI('caZ').setAttribute("disabled", "disabled");
	}else{
		dgEBI("rcaZ").removeAttribute("disabled");
		dgEBI("caZ").removeAttribute("disabled");
	}
	if(change==1){reload();}
}
var PLOTNUM =5;
window.onload = function(){
	setupcanvas();
	
	['ca','cp','fp','av'].forEach(function(value){setDefaltValue(value);});

	/*/
for(i=0;i<=3;i++){
	for(j=-PLOTNUM;j<=PLOTNUM;j++){
	for(k=-PLOTNUM;k<=PLOTNUM;k++){
		point.push(new Vertex(
			((i+PLOTNUM)%2==0?-j:k*(1-2*((j+PLOTNUM)%2))),
			(i-(i+PLOTNUM)%2)*2.3,
			((i+PLOTNUM)%2==0?-k*(1-2*((j+PLOTNUM)%2)):j)
		));
	}
	}
	}
		point.push(new Vertex(
			((i+PLOTNUM)%2==0?-j:k*(1-2*((j+PLOTNUM)%2))),
			((i+PLOTNUM)%2==0?-k*(1-2*((j+PLOTNUM)%2)):j),
			i-((i+PLOTNUM)%2-1)
		));

/*/




	for(i=-PLOTNUM*2;i<=PLOTNUM*2;i++){
	for(j=-PLOTNUM;j<=PLOTNUM;j++){
	for(k=-PLOTNUM;k<=PLOTNUM;k++){		
		point.push(new Vertex(
			((i+PLOTNUM)%2==0?-j:k*(1-2*((j+PLOTNUM)%2))),
			((i+PLOTNUM)%2==0?-k*(1-2*((j+PLOTNUM)%2)):j),
			i-(1-(i+PLOTNUM)%2)
		));
	}
	}
	}//*/
	

	numcalc(1);
	//setTimeout(reload,1000/FPS);
	//register(savepos);
	window.addEventListener('keydown',inkey,true);
	//colorC();
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
        var ct = cosK(theta);
        var st = sinK(theta);
        var cp = cosK(phi);
        var sp = sinK(phi);

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
            var theta = (evt.clientX - mx) * PI / 360;
            var phi = (evt.clientY - my) * PI / 180;

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
            rotate(cube.vertices[i], cube_center, -PI / 720, PI / 720);

        render(objects, ctx, dx, dy);

        autorotate_timeout = setTimeout(autorotate, 30);
    }
    //autorotate_timeout = setTimeout(autorotate, 2000);
*/
}
