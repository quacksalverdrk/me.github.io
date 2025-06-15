
class Card { 
	static v = 0;
	static c = 1;
	 p = -1;
	static s = "";
	constructor ( v ) { 
		this.v = v;
		this.c=1;
		this.p=-1;
		if ( v%5 == 0 ) { this.c ++ ; } 
		if ( v%10 == 0 ) { this.c ++ ; } 
		if ( v%11 == 0 ) { this.c +=4; } 
		if ( v%55 == 0 ) { this.c ++ ; } 
		this.s = "[" + ( ( v<10 ) ?" ":"" ) + ( ( v<100 ) ?" ":"" ) + v + " ." + this.c + "]\t";
	 } 
 } 
function cost ( x ) { 
	var res = 0;
	x.forEach ( value => { res += value.c; } ) 
	return res;
 } 
function display ( x ) { 
	var res = "";
	x.forEach ( value => { res += "p" + ( value.p ) + value.s; } ) 
	return res;
 } 
function distributeCard ( ) { 
	PlayerCard=[];
	PlayerCostCards=[];
	for ( var n=0; n<PlayerNum; n ++ ) { 
		PlayerCard.push ( [] ) ;
		PlayerCostCards.push ( [] ) ;
		for ( var i=0;i<CardNum;i ++ ) { 
			var rand=Math.floor ( Cards.length * Math.random ( ) ) ;
			PlayerCard[n].push ( Cards.splice ( rand , 1 ) [0] ) ;
			PlayerCard[n][PlayerCard[n].length-1].p = n;
		 } 
		PlayerCard[n].sort ( ( a , b ) => { return a.v-b.v; } ) ;
	 } 
 } 
function makeCards ( ) { 
	Cards=[];
	for ( var i=0;i<AllCardNum;i ++ ) { 
		Cards.push ( new Card ( i + 1 ) ) ;
		 // ss += Cards[i].s;
		 // if ( i%10 == 0 ) { ss +="\n"; } 
	 } 
 } 
function distributeDisplayCard ( ) { 
	DisplayCard = [];
	for ( var i=0;i<DisplayNum;i ++ ) { 
		DisplayCard.push ( [] ) ;
		var rand = Math.floor ( Cards.length * Math.random ( ) ) ;
		DisplayCard[i].push ( Cards.splice ( rand , 1 ) [0] ) ;
	 } 
	DisplayCard.sort ( ( a , b ) => { return a[0].v-b[0].v } ) ;
 } 
function selecting ( ) { 
	selectCard=[];
	for ( var n=0; n<PlayerNum; n ++ ) { 
		if ( PlayerCard[n].length > 0 ) { 
			var res = selectAI ( PlayerCard[n] , n ) ;
			selectCard.push ( PlayerCard[n].splice ( res , 1 ) [0] ) ;
		 } 
	 } 
 } 
function addminkey ( x ) { 
	for ( var i = DisplayCard.length-1;i >= 0;i-- ) { 
		 // console.log ( DisplayCard[i][DisplayCard[i].length - 1].v , x.v ) ;
		if ( DisplayCard[i][DisplayCard[i].length - 1].v < x.v ) { 	break; } 
	 } 
	return i;
 } 
function mincost ( ) { // 最も低い失点列を返す
	var res = DisplayCard.length-1;
	var cos = cost ( DisplayCard[res] ) ;
	for ( var i = DisplayCard.length-1;i >= 0; i-- ) { 
		if ( cost ( DisplayCard[i] ) < cos ) { 
			res = i;
		 } 
	 } 
	return res;
 } 
function status ( ) { 
	console.log ( "\n--------------------------------------------------------------" ) 
	console.log ( "\n\tselect: " + display ( selectCard ) + "\n\n" ) ;
	console.log ( "\ndisplay:\n" ) 
	DisplayCard.forEach ( ( item ) => { console.log ( "\t" , display ( item ) , cost ( item ) ) ; } ) ;
	console.log ( "\nPlayerCard:\n" ) 
	PlayerCard.forEach ( ( val , idx ) => { console.log ( "p" + idx + ": " + display ( val ) , cost ( PlayerCard[idx] ) ) } ) ;
	console.log ( "\nPlayerCardsCost:\n" ) 
	PlayerCostCards.forEach ( ( val , idx ) => { console.log ( "\tp" + idx + ": " + display ( val ) , cost ( PlayerCostCards[idx] ) ) } ) ;
 } 
function playNimmt ( ) { 
	var res=[] , PlayerCost = Array ( PlayerNum ) .fill ( 0 ) , CostMax = 0;
	do { 
		makeCards ( ) ;
		 // Cards.forEach ( value => { ss += value.s;	 } ) 
		distributeCard ( ) ;
		distributeDisplayCard ( ) ;
		 // status ( ) ;
		for ( var Turn=0; Turn<CardNum; Turn ++ ) { 
			 // console.log ( "\n------------------------------------Nimmt Turn[" + ( Turn ) + "]--------------------------------------------" ) 
			selecting ( ) ; // 各プレイヤーから、出すカードを選ぶ。
			selectCard.sort ( ( a , b ) => { return a.v - b.v; } ) ;
			 // status ( ) ;
			selectCard.forEach ( value => { 
				var player = value.p;
				 // console.log ( "\n\tselect: " + display ( selectCard ) + "\n\n" ) ;
				 // console.log ( "\n\tdisplay:\n" ) 
				 // DisplayCard.forEach ( item => { console.log ( display ( item ) , cost ( item ) ) } ) ;
				var key = addminkey ( value ) ;
				 // console.log ( "\ttouch" + player + ": " , value , "key:" + key ) ;
				if ( key != -1 ) { // 列に追加。
					DisplayCard[key].push ( value ) ;
				 } 
				if ( key == -1 || DisplayCard[key].length == Nimmt ) { // 追加する列無し or ニムト
					key = ( key == -1 ) ?mincost ( ) :key;
					 // console.log ( "key " + key + ": " , DisplayCard ) ;
					cat = DisplayCard[key].splice ( 0 ) ;
					 // console.log ( "cat: " , cat ) ;
					cat.forEach ( item => PlayerCostCards[player].push ( item ) ) ;
					DisplayCard[key].push ( value ) ;
					DisplayCard.sort ( ( a , b ) => { return a[0].v-b[0].v; } ) ;
				 } 
			 } ) ;
		 } 
		 // console.log ( PlayerCostCards ) ;
		PlayerCostCards.forEach ( ( item , player ) => { 
			tcost = cost ( item ) ;
			PlayerCost[player] += tcost;
			if ( PlayerCost[player]>CostMax ) { 	CostMax = PlayerCost[player];	 } 
		 } ) ;

	 } while ( CostMax<=66 ) ;
	RANK = rank ( PlayerCost ) ;
	PlayerCost.forEach ( ( item , player ) => { res.push ( { "p":player , "cost":item , "rank":RANK[player] } ) } ) 
	return res;
 } 
function rank( X ) { 
	var res =Array ( X.length ) .fill ( 1 ) ;
	for ( var i=0;i<X.length;i ++ ) { 
		for ( var k=0;k<X.length;k ++ ) { 
			if ( X[i]>X[k] ) { res[i] ++ ; } 
		 } 
	 } 
	return res;
 } 
function mainloop ( ) { 
	var ss="" , score = Array ( AllMethodNum ) .fill ( 0 ) , result=[] , mu=score.slice ( ) , sd=mu.slice ( ) , PGroup=mu.slice ( ) , win=0;
	Cards=[]; PlayerCard=[]; PlayerCostCards=[]; DisplayCard=[]; selectCard=[];	PlayerNum =0;
	if ( Math.floor ( ( method.length-2 ) / ( PlayerMAX-1 ) ) !=0 ) { console.log ( "Undefined Players!" ) ; } 	method.forEach ( res=> { PGroup[res] ++ ;PlayerNum ++ } ) ;
	if ( log_Lv > 1 ) { console.log ( "\tplayers: " , method ) ; } 
	for ( var k=0;k<repeat;k ++ ) { xa=playNimmt ( ) ;result.push ( xa ) ; xa.forEach ( ( item , pn ) => { score[method[pn]] += item.rank; } ) ; } 
	score.forEach ( ( res , i ) => { score[i] = ( score[i] / repeat / PGroup[i] + "" ) .match ( NF2 ) * 1 } ) ;var kkk = ( repeat-1 ) * PlayerNum / 2;
	score.forEach ( ( a , i , s ) => { if ( a == 0 ) { return } win= ( s[win] == 0 ) ? ( i ) : ( ( a<s[win] ) ? ( i ) :win ) } ) ;meswin_num[win] ++ ;
	if ( log_Lv > 1 ) {result.forEach ( res_x => { res_x.forEach ( m_res => { 	mes = method[m_res.p];	mu[mes] += m_res.cost; } ) } ) ;
	mu.forEach ( ( mm , i ) => { mu[i] = ( ( ( mu[i] / kkk ) + "" ) .match ( NF2 ) * 1 ) ; } ) ;
	result.forEach ( res_x => { res_x.forEach ( s_res => { 	mes = method[s_res.p];	sd[mes] += ( s_res.cost-mu[mes] ) ** 2; } ) } ) ;
	sd.forEach ( ( sig , i ) => { sig /= kkk; sd[i] = ( Math.sqrt ( sig ) + "" ) .match ( NF2 ) * 1; } ) ;ss += " (μ ±3.29σ α=0.001***) :\t";
	mu.forEach ( ( mm , i ) => { if ( mm == 0 ) { return; } d = 3.29 * sd[i] / Math.sqrt ( kkk ) ; ss += ( mu[i]-d + "" ) .match ( NF2 ) + " ~ mu[" + i + "] ~ " + ( mu[i] + d + "" ) .match ( NF2 ) + "\t"; } ) ;
	console.log ( "cost_μ:" , mu , "\tcost_σ:" , sd , "\tranking_av:" , score , "\n" , ss , "win method= " + win ) ; } 
	return score;
 } 
function rating1500 ( x ) { 
	return Math.round ( Math.log10 ( ( 2-x ) / ( x-1 ) ) * 400 + 1500 ) ;
 } 
function winmesnum ( win , METH , num ) { 
	 // 数値探索全表示
	Array ( ( alfa[METH].length + 2 ) ) .fill ( 0 ) .forEach ( ( aa , i ) => { var idx= ( alfa[METH].length-i + 1 ) ;if ( idx!=1 ) { win.sort ( ( a , b ) => { return a[idx] - b[idx] } ) ; } } ) ;
	ss="";win.forEach ( ( mm , i , s ) => { 	mm.forEach ( ( af , afi , si ) => { ss +=af + "\t"; } ) ;	ss +="\n"; } ) ;
	console.log ( ss ) ;

	 // 数値探索上位100平均値表示
	win.sort ( ( a , b ) => { return a[1] - b[1]; } ) ;
	X = win.slice ( 0 , num ) ;
	AV=Array ( 8 ) .fill ( 0 ) ;X.forEach ( ( mm , i , s ) => { mm.forEach ( ( x , xi , xs ) => { AV[xi] +=x } ) ; } ) ;
	AV.forEach ( ( x , xi ) => { AV[xi] /=num } ) ;
	console.log ( num + "ave ( alfa[" + METH + "] ) :" , AV , "\nbest:" , win[0] , rating1500 ( win[0][1] ) ) ;
 } 
function roll_ball ( METH , MAXorder , STEPorder , MAXtimes) { 
	var alfas=[] ,winalfa=[];console.clear ( ) ;
	for ( times=0;times<MAXtimes;times ++ ) { // 
		if ( man == null ) { man　= method.length; } 	
		
		all = mainloop ( ) ;winalfa.push ( [man , all[METH]].concat ( alfa[METH] ) ) ;
		var st = rank(all);
		METH = (st.indexOf(AllMethodNum)==-1?st.indexOf(AllMethodNum-1):st.indexOf(AllMethodNum));

		var IndexMax = alfa[METH].length , points = [];
		var STpoint = { "score":all[METH] , "order": 0 , "idx": -1 , "sign":0 , "alfa":alfa[METH].slice ( ) ,"all":all } // 初期基準スポットαを探索
		var order=-1;
		while ( order < MAXorder ) { 
			var n=0;
			while ( n<IndexMax ) { 
				points=[];
				for ( var sign=-1; sign<2; sign ++ ) { 					 // +=2 :基準を再検査しない	 ++ :基準を再検査する
					alfa[METH] = STpoint.alfa.slice ( ) ;				 // 基準スポットをαをロード
					alfa[METH][n] = Math.round ( 10000 * ( alfa[METH][n] + sign / ( 2 ** order ) ) ) / 10000;			 // 周辺スポットを探索
					all = mainloop ( ) ;winalfa.push ( [man , all[METH]].concat ( alfa[METH] ) ) ;
					if ( all[METH]<x715[man-2] ) { console.log ( man , alfa[METH] , "\tav_rank: " , all ) ;
					 } else if ( man == 2&&all[METH]<x715[man-2] ) { console.log ( man , alfa[METH] , "\tav_rank: " , all , rating1500 ( all[METH]) ) ; } 
					point = { "score":all[METH] , "order": order , "idx": n , "sign":sign , "alfa":alfa[METH],"all":all  } // 基準スポットを探索
					if ( log_Lv > 0 ) console.log ( point , alfa[METH] ) ;
					points.push ( point ) ;
				 } 
				points.sort ( ( a , b ) => { return a.score - b.score; } ) ;	 // 最も低いスポットの方向に移動
				STpoint = points[0];
				if ( log_Lv=>0 )console.log ( method.length, STpoint.all, STpoint , "alfa[" + METH + "]: " , alfa[METH] ) ;
				if ( STpoint.sign == 0 ) { n ++ ;STpoint.idx=-1;STpoint.order=0;STpoint.sign=0; } 	 // 新基準スポットに		 // 新基準スポットが最小なら、別次元の周辺を調べる
			 } 
			if ( STpoint.sign == 0 ) { order += STEPorder; } 						 // 新基準スポットが最小なら、周辺を細かく調べる
		 } 
		alfas.push ( STpoint.all ) ;
		if ( log_Lv=>0 ) console.log ( STpoint ) ;
	 }
	winmesnum ( winalfa , METH , MAXtimes ) ;
	return alfas;
 } 
function roll_ball2 (METH , MAXorder , STEPorder , MAXtimes) { 
	var alfas=[] ,winalfa=[];//true:基準を再検査する	 false :基準を再検査しない
	console.clear ( ) ;
	for ( times=0;times<MAXtimes;times ++ ) { // 
		all = mainloop ( ) ;winalfa.push ( [method.length , all[METH]].concat ( alfa[METH] ) ) ;
		var st = rank(all);
		var IndexMax = alfa[METH].length , points = [];
		var STpoint = { "score":all[METH] , "order": 0 , "idx": -1 , "sign":0 , "alfa":alfa[METH].slice ( ) ,"all":all } // 初期基準スポットαを探索
		var order=-1;
		while ( order < MAXorder ) { 
			var n=0;
			while ( n<IndexMax ) { 
				points=[];
				for ( var sign=-1; sign<2; sign += 1 ) { 				
					alfa[METH] = STpoint.alfa.slice ( ) ;				 // 基準スポットをαをロード
					if( STpoint.alfa.length == n || STpoint.alfa[n]==null ) alfa[METH].push(0); 
					alfa[METH][n] = Math.round ( 10000 * ( (alfa[METH][n]!=null?alfa[METH][n]:0) + sign / ( 2 ** order ) ) ) / 10000;		// 周辺スポットを探索
					all = mainloop ( ) ;winalfa.push ( [method.length , all[METH]].concat ( alfa[METH] ) ) ;
					if ( all[METH]<x715[method.length-2] ) { console.log ( method.length , alfa[METH] , "\tav_rank: " , all ) ;
					} else if ( method.length == 2&&all[METH]<x715[method.length-2] ) { console.log ( method.length , alfa[METH] , "\tav_rank: " , all , rating1500 ( all[METH]) ) ; } 
					point = { "score":all[METH] , "order": order , "idx": n , "sign":sign , "alfa":alfa[METH],"all":all  } // 基準スポットを探索
					if ( log_Lv > 0 ) console.log ( point , alfa[METH] ) ;
					points.push ( point ) ;
				 } 
				points.sort ( ( a , b ) => { return a.score - b.score; } ) ;	 	// 最も低いスポットの方向に移動
				STpoint = points[0];
				if ( log_Lv=>0 )console.log ( method.length, STpoint.all, STpoint , "alfa[" + METH + "]: " , alfa[METH] ) ;
				if ( STpoint.sign == 0 ) { n ++ ;STpoint.idx=-1;STpoint.order=0;STpoint.sign=0; } 	 // 新基準スポットに		 // 新基準スポットが最小なら、別次元の周辺を調べる
			 } 
			if ( STpoint.sign == 0 ) { order += STEPorder; } 					 // 新基準スポットが最小なら、周辺を細かく調べる
		 } 
		alfas.push ( STpoint.all ) ;
		if ( log_Lv=>0 ) console.log ( STpoint ) ;
	 }
	winmesnum ( winalfa , METH , MAXtimes ) ;
	return alfas;
 }
function roll_ball3 (METH , MAXorder ,  MAXtimes) { 
	var alfas=[] ,winalfa=[];
	console.clear ( ) ;repeat = 100;
	all = mainloop ( ) ;winalfa.push ( [method.length , all[METH]].concat ( alfa[METH] ) ) ;
	var IndexMax = alfa[METH].length , points = [];
	var STpoint = { "score":all[METH] , "d_z": 0 , "idx": -1 , "sign":0 , "alfa":alfa[METH].slice ( ) ,"all":all } // 初期基準スポットαを探索
	var bscore = all[METH];
	while ( 0 < MAXtimes-- ) {
		var n=0;
		 do{ 
			points=[];
			for ( var sign=-1; sign<2; sign += 2 ) {//現在地から、正負両方向に探索
				var times=0, z = 0;
					bscore = all[METH]+0.15;
				do{
					bscore = all[METH];
					repeat = 100;															//100回のプレテストで移動量と回数を設定
					all = mainloop () ;
					var d_z = sign / ( 2 **(MAXorder * (method.length　-all[METH])-1) );			//移動量
					z = Math.round ( 10000 * (z + d_z)) / 10000
					repeat = Math.floor(( 70*method.length )* (100**( (method.length + 1.25 -all[METH])/method.length)));				//回数				alfa[METH] = STpoint.alfa.slice ( ) ;				 					// 基準スポットをαをロード
					alfa[METH][n] = Math.round ( 10000 * ( alfa[METH][n] + z ) ) / 10000;		// 周辺スポットを探索
					all = mainloop ( ) ;
					var point = { "score":all[METH] , "d_z": z , "rpt": repeat ,  "idx": n , "sign":sign , "alfa":alfa[METH],"all":all  } // 基準スポットを探索
					if ( log_Lv > 0 ) console.log ( point ,times++, alfa[METH] ) ;
					points.push ( point ) ;
					if(bscore> STpoint.score + 0.15){break;}
				 }while (bscore > all[METH]);
			}
			points.sort ( ( a , b ) => { return a.score - b.score; } ) ;	 	// 最も低いスポットの方向に移動
			STpoint = points[0];
			winalfa.push ( [method.length , STpoint.score].concat (  STpoint.alfa ) ) ;
			if ( log_Lv=>0 ) console.log ( method.length, STpoint.all, STpoint , "alfa[" + METH + "]: " , alfa[METH],) ;
		 }while ( ++n < IndexMax );
		alfas.push ( STpoint.all ) ;
		if ( log_Lv=>0 ) console.log ( STpoint ) ;
	 }
	winmesnum ( winalfa , METH , MAXtimes ) ;
	return alfas;
 } 
function selectAI ( pCard , pn ) { 
	var res = 0, resRISK = false, mes_id=0;
	if ( pn < 0 ){ pn = -pn; resRISK = true;}
	METH = method[pn];
	if ( METH == mes_id++ ) { 	res =Math.floor ( pCard.length * Math.random ( ) ) ; } 
	else if ( METH == mes_id++ ) { //1 1.385
			 // Kcst , cNUM [2.3125 , 7.40625]
		var candy=[];
		var Kcst=0 , min=0 , cNUM=0 ;
		 // status ( ) ;
		min = cost ( DisplayCard[mincost ( ) ] ) ;							 // 万が一のときに引き取る列のコスト合計
		pCard.forEach ( ( p , idx ) => { 
			key = addminkey ( p ) ;
			Kcst = alfa[METH][0] * ( key == -1 ) ?min: ( cost ( DisplayCard[key] ) ) ;	 // 挿入される予定列のコスト合計2.15
			cNUM = ( key == -1 ) ?0: ( alfa[METH][1] ** DisplayCard[key].length ) ;		 // 枚数ごとに乗数[7.5 56.25 422 3164 23730]7.5
			var risk = Kcst + cNUM;
			candy.push ( risk ) ; 								 // 累計リスク 単位をコストに統一しよう
			if ( log_Lv > 2 ) console.log ( "\n\tris_cal: " , p.s , "\tpcard[" + idx + "]\tkey: " , key , "\tKcst: " , Kcst , "\tcNUM: " , cNUM , "\t[risk]: " , candy[idx] ) ;
		 } ) ;
		candy.forEach ( ( a , i , s ) => {	if ( a == 0 ) { return; }	res = ( s[res] == 0 ? i : ( a < s[res] ? i :res) );	} ) ;	 // リスク値の最も低いカードを出す。
		if ( log_Lv > 2 ) console.log ( "\n\tmin_risk: " , res ) ;
	 } 
	else if ( METH == mes_id++ ) { //2 1.135
		 // Kcst , cNUM
		var candy=[]; // alfa2=[1 , 1 , 1.75 , 1.25 , 6 , -1];
		if ( log_Lv > 2 ) { status ( ) ; } 
		pCard.forEach ( ( p , idx ) => { 
			var dist=0 , mean=0 , Kcst=0 , min=0 , rest=0 , cNUM=0 , risk=0;
			key = addminkey ( p ) ;														 	// カードの入る列
			minkey = mincost ( ) ;
			rest = alfa[METH][0] * pCard.length * ( PlayerNum-1 ) ;								// プレイヤー人数 増えるカードの可能性
			if ( key == -1 ) { 																// 万が一のときに引き取る列のコスト合計
				dist = alfa[METH][1] * ( p.v - DisplayCard[0][DisplayCard[0].length - 1].v - (method.length-1) ) ;	 // 挿入されるカード列の値の差
				min = ( cost ( DisplayCard[minkey] ) + rest ) ** ( DisplayCard[minkey].length ) + ( dist * alfa[METH][2] ) ;
				if ( log_Lv > 2 ) { console.log ( "\n\minkey: " , minkey , "\t.cost: " , cost ( DisplayCard[minkey] ) , "\t.length: " , DisplayCard[minkey].length ) ; } 
			 } else { 
				dist = alfa[METH][3] * ( p.v - DisplayCard[key][DisplayCard[key].length - 1].v - (method.length-1) ) ; // 挿入されるカード列の値の差
				Kcst = alfa[METH][4] * cost ( DisplayCard[key] ) ;								// 挿入される予定列のコスト合計
				cNUM = alfa[METH][5] ** DisplayCard[key].length;									// 枚数ごとに乗数[2	4	8	16	32]
				mean = ( p.v * alfa[METH][6] ) ;												// カードの値係数
			 } 
			risk = 1 + ( ( key == -1 ) ?min: dist * ( mean + rest + Kcst ) + cNUM ) ;
			candy.push ( risk ) ; 					
			if ( log_Lv > 2 ) { console.log ( "\n\tris_cal: " , p.s , "\tpcard[" + idx + "]\tkey: " , key , "\tmin: " , min , "\tmean: " , mean , "\trest: " , rest , "\tdist: " , dist , "\tKcst: " , Kcst , "\tcNUM: " , cNUM , "\t[risk]: " , risk ) ; } 
		 } ) ;
		candy.forEach ( ( a , i , s ) => {	if ( a == 0 ) { return; }	res = ( s[res] == 0 ? i : ( a < s[res] ? i :res) );	} ) ;	 // リスク値の最も低いカードを出す。
		if ( log_Lv > 2 ) { console.log ( "\n\tmin_risk: " , res , "\tselect: " , pCard[res].s , "\t[risk]: " , candy[res] ) ; } 
	} 
	else if ( METH == mes_id++ ) { //3 1.122
			 // Kcst , cNUM [2.3125 , 7.40625]
		var candy=[];
		var dist=0 , mean=0 , Kcst=0 , min=0 , rest=0 , cNUM=0 ;
		 // status ( ) ;
		min = cost ( DisplayCard[ mincost ( ) ] ) ;							 // 万が一のときに引き取る列のコスト合計
		pCard.forEach( p => {mean += p.v/pCard.length;} ) 
		pCard.forEach ( ( p , idx ) => { 
			key = addminkey ( p ) ;
			dist = alfa[METH][0] * ( p.v - DisplayCard[0][DisplayCard[0].length - 1].v - (method.length-1) ) ;	 // 挿入されるカード列の値の差
			dist2 = alfa[METH][1] * ( p.v - mean ) ;
			pval = ( p.v * alfa[METH][2] + AllCardNum * alfa[METH][3]) ;										 // カードの値係数
			cNUM = ( key == -1  ? 0 :  alfa[METH][4] ** DisplayCard[key].length ) ;								 // 枚数ごとに乗数
			Kcst =  ( key == -1 ? alfa[METH][5] * min : alfa[METH][6] * cost ( DisplayCard[key] ) ) ;	 // 挿入される予定列のコスト合計2.15
			var risk = Kcst + dist2 + dist * (cNUM + pval ) * (cNUM==0 ? alfa[METH][7] : alfa[METH][8]);										// 累計リスク 単位をコストに統一しよう
			candy.push (risk) ; 								 
			if ( log_Lv > 2 ) console.log ( "\n\tris_cal: " , p.s , "\tpcard[" + idx + "]\tkey: " , key , "\tKcst: " , Kcst , "\tcNUM: " , cNUM , "\t[risk]: " , candy[idx] ) ;
		 } ) ;
		candy.forEach ( ( a , i , s ) => {	if ( a == 0 ) { return; }	res = ( s[res] == 0 ? i : ( a < s[res] ? i :res) );	} ) ;	 // リスク値の最も低いカードを出す。
		if ( log_Lv > 2 ) { console.log ( "\n\tmin_risk: " , res , "\tselect: " , pCard[res].s , "\t[risk]: " , candy[res] ) ; } 
	}
	else if ( METH == mes_id++ ) {// copy method2	1.3916
		 // Kcst , cNUM
		var candy=[]; // alfa2=[1 , 1 , 1.75 , 1.25 , 6 , -1];
		if ( log_Lv > 2 ) { status ( ) ; } 
		pCard.forEach ( ( p , idx ) => { 
			var dist=0 ,dist2 = 0,dist3=0, mean=0 , Kcst=0 , min=0 , rest=0 , cNUM=0 , risk=0,id=0;
			key = addminkey ( p ) ;														 	// カードの入る列
			minkey = mincost ( ) ;
			rest = alfa[METH][id++] * pCard.length * ( PlayerNum-1 ) ;								// プレイヤー人数 増えるカードの可能性
			dist2 = alfa[METH][id++] * ( p.v - mean ) ;
			pval = ( p.v * alfa[METH][id++] + AllCardNum * alfa[METH][id++]) ;					// カードの値係数
			dist = alfa[METH][id++] * ( p.v - DisplayCard[0][DisplayCard[0].length - 1].v - (method.length-1) ) ;	 // 挿入されるカード列の値の差
			min = ( cost ( DisplayCard[minkey] ) + rest ) ** ( DisplayCard[minkey].length ) + ( dist * alfa[METH][id++] ) ;// 万が一のときに引き取る列のコスト合計
			if ( log_Lv > 2 ) { console.log ( "\n\minkey: " , minkey , "\t.cost: " , cost ( DisplayCard[minkey] ) , "\t.length: " , DisplayCard[minkey].length ) ; } 
			dist3 = (key == -1?0:alfa[METH][id++] * ( p.v - DisplayCard[key][DisplayCard[key].length - 1].v - (method.length-1) )+ alfa[METH][id++]); // 挿入されるカード列の値の差
			Kcst = (key == -1?0:alfa[METH][id++] * cost ( DisplayCard[key] ) );								// 挿入される予定列のコスト合計
			cNUM = (key == -1?0:alfa[METH][id++] ** DisplayCard[key].length);									// 枚数ごとに乗数[2	4	8	16	32]
			risk = 1 + ( ( key == -1 ) ?min:  dist2 + dist * (cNUM +pval) + rest + Kcst + cNUM ) ;
			candy.push ( risk ) ; 					
			if ( log_Lv > 2 ) { console.log ( "\n\tris_cal: " , p.s , "\tpcard[" + idx + "]\tkey: " , key , "\tmin: " , min , "\tmean: " , mean , "\trest: " , rest , "\tdist: " , dist , "\tKcst: " , Kcst , "\tcNUM: " , cNUM , "\t[risk]: " , risk ) ; } 
		 } ) ;
		candy.forEach ( ( a , i , s ) => {	if ( a == 0 ) { return; }	res = ( s[res] == 0 ? i : ( a < s[res] ? i :res) );	} ) ;	 // リスク値の最も低いカードを出す。
		if ( log_Lv > 2 ) { console.log ( "\n\tmin_risk: " , res , "\tselect: " , pCard[res].s , "\t[risk]: " , candy[res] ) ; } 
	} 
	else if ( METH == mes_id++ ) {// copy method3	1.1767
			 // Kcst , cNUM [2.3125 , 7.40625]
		var candy=[];
		var dist=0 , mean=0 , Kcst=0 , min=0 , rest=0 , cNUM=0 ;
		 // status ( ) ;
		min = cost ( DisplayCard[ mincost ( ) ] ) ;							 // 万が一のときに引き取る列のコスト合計
		pCard.forEach( p => {mean += p.v/pCard.length;} ) 
		pCard.forEach ( ( p , idx ) => { 
			key = addminkey ( p ) ;
			var id = 0;
			dist = alfa[METH][id++] * ( p.v - DisplayCard[0][DisplayCard[0].length - 1].v - (method.length-1) ) ;	 // 挿入されるカード列の値の差
			dist2 = alfa[METH][id++] * ( p.v - mean ) ;
			pval = ( p.v * alfa[METH][id++] + AllCardNum * alfa[METH][id++]) ;					// カードの値係数
			cNUM = ( key == -1 ) ? 0 : ( alfa[METH][id++] ** DisplayCard[key].length ) ;		 // 枚数ごとに乗数
			Kcst =  ( key == -1 ? alfa[METH][id++] * min : alfa[METH][id+1] *cost ( DisplayCard[key] ) ) ;	 // 挿入される予定列のコスト合計2.15
			var risk = Kcst + dist2 + dist * (cNUM + pval ) * (cNUM==0 ? alfa[METH][id+2] : alfa[METH][id+3]);										// 累計リスク 単位をコストに統一しよう
			candy.push (risk) ; 								 
			if ( log_Lv > 2 ) console.log ( "\n\tris_cal: " , p.s , "\tpcard[" + idx + "]\tkey: " , key , "\tKcst: " , Kcst , "\tcNUM: " , cNUM , "\t[risk]: " , candy[idx] ) ;
		 } ) ;
		candy.forEach ( ( a , i , s ) => {	if ( a == 0 ) { return; }	res = ( s[res] == 0 ? i : ( a < s[res] ? i :res) );	} ) ;	 // リスク値の最も低いカードを出す。
		if ( log_Lv > 2 ) { console.log ( "\n\tmin_risk: " , res , "\tselect: " , pCard[res].s , "\t[risk]: " , candy[res] ) ; } 
	} 
	else if ( METH == mes_id++ ) {// copy method2 vs 3 1.4585
		 // Kcst , cNUM
		var candy=[]; // alfa2=[1 , 1 , 1.75 , 1.25 , 6 , -1];
		if ( log_Lv > 2 ) { status ( ) ; } 
		pCard.forEach ( ( p , idx ) => { 
			var dist=0 ,dist2 = 0,dist3=0, mean=0 , Kcst=0 , min=0 , rest=0 , cNUM=0 , risk=0,id=0;
			key = addminkey ( p ) ;														 	// カードの入る列
			minkey = mincost ( ) ;
			rest = alfa[METH][id++] * pCard.length * ( PlayerNum-1 ) ;								// プレイヤー人数 増えるカードの可能性
			dist2 = alfa[METH][id++] * ( p.v - mean ) ;
			pval = ( p.v * alfa[METH][id++] + AllCardNum * alfa[METH][id++]) ;					// カードの値係数
			dist = alfa[METH][id++] * ( p.v - DisplayCard[0][DisplayCard[0].length - 1].v - (method.length-1) ) ;	 // 挿入されるカード列の値の差
			min = ( cost ( DisplayCard[minkey] ) + rest ) ** ( DisplayCard[minkey].length ) + ( dist * alfa[METH][id++] ) ;// 万が一のときに引き取る列のコスト合計
			if ( log_Lv > 2 ) { console.log ( "\n\minkey: " , minkey , "\t.cost: " , cost ( DisplayCard[minkey] ) , "\t.length: " , DisplayCard[minkey].length ) ; } 
			dist3 = (key == -1?0:alfa[METH][id++] * ( p.v - DisplayCard[key][DisplayCard[key].length - 1].v - (method.length-1) )+ alfa[METH][id++]); // 挿入されるカード列の値の差
			Kcst = (key == -1?0:alfa[METH][id++] * cost ( DisplayCard[key] ) );								// 挿入される予定列のコスト合計
			cNUM = (key == -1?0:alfa[METH][id++] ** DisplayCard[key].length);									// 枚数ごとに乗数[2	4	8	16	32]
			risk = 1 + ( ( key == -1 ) ?min:  dist2 + dist * (cNUM +pval) + rest + Kcst + cNUM ) ;
			candy.push ( risk ) ; 					
			if ( log_Lv > 2 ) { console.log ( "\n\tris_cal: " , p.s , "\tpcard[" + idx + "]\tkey: " , key , "\tmin: " , min , "\tmean: " , mean , "\trest: " , rest , "\tdist: " , dist , "\tKcst: " , Kcst , "\tcNUM: " , cNUM , "\t[risk]: " , risk ) ; } 
		 } ) ;
		candy.forEach ( ( a , i , s ) => {	if ( a == 0 ) { return; }	res = ( s[res] == 0 ? i : ( a < s[res] ? i :res) );	} ) ;	 // リスク値の最も低いカードを出す。
		if ( log_Lv > 2 ) { console.log ( "\n\tmin_risk: " , res , "\tselect: " , pCard[res].s , "\t[risk]: " , candy[res] ) ; } 
	} 
	else if ( METH == mes_id++ ) {// copy method3 vs 2 1.35
			 // Kcst , cNUM [2.3125 , 7.40625]
		var candy=[];
		var dist=0 , mean=0 , Kcst=0 , min=0 , rest=0 , cNUM=0 ;
		 // status ( ) ;
		min = cost ( DisplayCard[ mincost ( ) ] ) ;							 // 万が一のときに引き取る列のコスト合計
		pCard.forEach( p => {mean += p.v/pCard.length;} ) 
		pCard.forEach ( ( p , idx ) => { 
			key = addminkey ( p ) ;
			var id = 0;
			dist = alfa[METH][id++] * ( p.v - DisplayCard[0][DisplayCard[0].length - 1].v - (method.length-1) ) ;	 // 挿入されるカード列の値の差
			dist2 = alfa[METH][id++] * ( p.v - mean ) ;
			pval = ( p.v * alfa[METH][id++] + AllCardNum * alfa[METH][id++]) ;					// カードの値係数
			cNUM = ( key == -1 ) ? 0 : ( alfa[METH][id++] ** DisplayCard[key].length ) ;		 // 枚数ごとに乗数
			Kcst =  ( key == -1 ? alfa[METH][id++] * min : alfa[METH][id+1] *cost ( DisplayCard[key] ) ) ;	 // 挿入される予定列のコスト合計2.15
			var risk = Kcst + dist2 + dist * (cNUM + pval ) * (cNUM==0 ? alfa[METH][id+2] : alfa[METH][id+3]);										// 累計リスク 単位をコストに統一しよう
			candy.push (risk) ; 								 
			if ( log_Lv > 2 ) console.log ( "\n\tris_cal: " , p.s , "\tpcard[" + idx + "]\tkey: " , key , "\tKcst: " , Kcst , "\tcNUM: " , cNUM , "\t[risk]: " , candy[idx] ) ;
		 } ) ;
		candy.forEach ( ( a , i , s ) => {	if ( a == 0 ) { return; }	res = ( s[res] == 0 ? i : ( a < s[res] ? i :res) );	} ) ;	 // リスク値の最も低いカードを出す。
		if ( log_Lv > 2 ) { console.log ( "\n\tmin_risk: " , res , "\tselect: " , pCard[res].s , "\t[risk]: " , candy[res] ) ; } 
	} 
	else if ( METH == mes_id++ ) {// copy method3 vs 1 1.478
			 // Kcst , cNUM [2.3125 , 7.40625]
		var candy=[];
		var dist=0 , mean=0 , Kcst=0 , min=0 , rest=0 , cNUM=0 ;
		 // status ( ) ;
		min = cost ( DisplayCard[ mincost ( ) ] ) ;							 // 万が一のときに引き取る列のコスト合計
		pCard.forEach( p => {mean += p.v/pCard.length;} ) 
		pCard.forEach ( ( p , idx ) => { 
			key = addminkey ( p ) ;
			var id = 0;
			dist = alfa[METH][id++] * ( p.v - DisplayCard[0][DisplayCard[0].length - 1].v - (method.length-1) ) ;	 // 挿入されるカード列の値の差
			dist2 = alfa[METH][id++] * ( p.v - mean ) ;
			pval = ( p.v * alfa[METH][id++] + AllCardNum * alfa[METH][id++]) ;					// カードの値係数
			cNUM = ( key == -1 ) ? 0 : ( alfa[METH][id++] ** DisplayCard[key].length ) ;		 // 枚数ごとに乗数
			Kcst =  ( key == -1 ? alfa[METH][id++] * min : alfa[METH][id+1] *cost ( DisplayCard[key] ) ) ;	 // 挿入される予定列のコスト合計2.15
			var risk = Kcst + dist2 + dist * (cNUM + pval ) * (cNUM==0 ? alfa[METH][id+2] : alfa[METH][id+3]);										// 累計リスク 単位をコストに統一しよう
			candy.push (risk) ; 								 
			if ( log_Lv > 2 ) console.log ( "\n\tris_cal: " , p.s , "\tpcard[" + idx + "]\tkey: " , key , "\tKcst: " , Kcst , "\tcNUM: " , cNUM , "\t[risk]: " , candy[idx] ) ;
		 } ) ;
		candy.forEach ( ( a , i , s ) => {	if ( a == 0 ) { return; }	res = ( s[res] == 0 ? i : ( a < s[res] ? i :res) );	} ) ;	 // リスク値の最も低いカードを出す。
		if ( log_Lv > 2 ) { console.log ( "\n\tmin_risk: " , res , "\tselect: " , pCard[res].s , "\t[risk]: " , candy[res] ) ; } 
	} 
	else if ( METH == mes_id++ ) { 	pCard.sort ( ( a , b ) => { return ( a.v - b.v ) ; } ) ;pCard.sort ( ( a , b ) => { return - ( a.c - b.c ) ; } ) ; } 
	else if ( METH == mes_id++ ) { 	pCard.sort ( ( a , b ) => { return ( a.v - b.v ) ; } ) ;pCard.sort ( ( a , b ) => { return ( a.c - b.c ) ; } ) ;} 
	else if ( METH == mes_id++ ) { 	res = pCard.length-1; } 
	else if ( METH == mes_id++ ) { 	res = 0; } 
	return res;
 } 
var NF2 = /-?\d+[.]?[\d]{0,4}/ , Nimmt = 6 , AllCardNum = 104 , CardNum = 10 , DisplayNum = 4 , PlayerMAX = 10 , AllMethodNum = 10 , log_Lv=1 , 
alfa= { 1:[5.285 , 1.8125] , 
//	2:[3.401, 0.02, 14.0088, 0.02, -1.6528, 7.0993, 0.0312], 
//	3:[9.2836, -7.5375, 10 , 0.0327, 8.2452, 11.6335, 0 ,0.5834] // [1 , 1.5 , 3 , 1 , 6 , 0]
	2:[4.8117, 0.0918, 7.5061, 0.0165, -5.6927, 4.0334, 0.086, 0.4347, 8.4623] ,
//	3:[0.0966, 4.0672, -1.0866, 0.6583, -1.9851, 0.6789, 49.0835, 2.6224, 0.8831]//
3: [0.0544,2.2307,-1.1021,0.7914,-2.0094, -13.7161,36.1579,4.5826,1.1223] ,
4: [8.3252, 5.0464, -4.0251, 3.7926, 0.0759, 17.3178, -1.1083, -2.8657, 22.5022, -6.441],
5:[0.8201, -8.3261, 15.2315, 7.2693, 7.8076, 15.134, -8.6699, 3.571, 17.6463],
//5:[0.5672, -8.5212, 15.6306, 7.1169, 7.8713, 14.9858, -9.7546, 3.8987, 17.7351] ,
6:[-13.0362, 1.1347, 0.7848, 1.4721, 2.8911, 3.0911, 1.3251, -5.5297, -4.8179, 11.5958],
//6: [21.3282, -18.1326, -0.7045, -1.9199, -1.7366, -6.8687, 2.4895, -0.7902, 26.798, -7.4368] ,
7:[-26.3294, 27.6365, 0.1977, 1.8331, 29.6395, 10.8253, 9.5082, -12.5828, -11.4445, -3.9517],
//8:[-5.3573, 5.3371, -3.5887, 3.5649, 2.4552, -1.215, 3.4163, -0.0479, -2.341, -1.861],
8:[ -5.438, 9.2544, -1.4191, 8.7602, 6.0044, -2.4656, 0.4895, -2.6908, -2.1311, 3.2736]
//8:[1,1,1,1,1 ,1,1,1,1,1],
 // @5		3:[7.081400502 , 	-4.474390663 , 	0.205615306 , 	-1.222216022 , 	9.295685649 , 	-0.942536414] // [1 , 1.5 , 3 , 1 , 6 , 0]
 } 

 repeat = 10000 , PlayerNum = 0 , 
 Cards=[] , PlayerCard=[] , PlayerCostCards=[] , DisplayCard=[] , selectCard=[] , method=[] , meswin_num = Array ( AllMethodNum ) .fill ( 0 ) ;
 // x715=[1.39 , 1.7 , 2.1 , 2.6 , 3.18 , 3.6 , 4.1 , 4.55 , 5];
 // x715=[1.40 , 1.67 , 2.0 , 2.5 , 3.0 , 3.5 , 4.0 , 4.38 , 4.9];
 // x715=[1.23 , 1.35 , 1.51 , 2.0 , 2.6 , 3.0 , 3.35 , 3.8 , 4.2];	alfa2=[1.03 , 0 , 0.21875 , -1.3125 , 4.75 , 0]
x715=[1.12 , 1.27 , 1.47 , 1.78 , 2.50 , 2.86 , 3.21 , 3.61 , 4.13]; // 	alfa3=[1 , 1 , 1 , 2 , 4 , 0]
 // 0[ , ] ( ( 1[.]1[012] ) | ( 1[.]2[456] ) | ( 1[.]4[456] ) | ( 1[.]7[789] ) | ( 2[.]4[789] ) | ( 2[.][8][345] ) | ( 3[.] ( 2[0]|1[789] ) ) | ( 3[.] ( 6[0] ) |5[789] ) | ( 4[.]1[012] ) ) 

log_Lv=1;var methodNUMBER=8; method = [1,1, methodNUMBER] ;
a = roll_ball3 ( methodNUMBER , 5 , 100) ;console.log ( a ) ;

log_Lv=0;repeat = 20000;var methodNUMBER=7; method = [3, methodNUMBER] ;
a = roll_ball2 ( methodNUMBER , 7 , 0.5 , 10) ;console.log ( a ) ;


 ( ) => { var methodNUMBER=3; // 総マッピング探索
	console.clear ( ) ; meswin_num = Array ( AllMethodNum ) .fill ( 0 ) ;winalfa=[];log_Lv=0;repeat = 10000;
		for ( a0=0;a0<=3;a0 +=1 / 2 ** 1 ) { // 	0.75? ( 1.3125 ) < / <1.5
		for ( a1=0;a1<=3;a1 +=1 / 2 ** 1 ) { // -1.0?< ( 0.0 ) < / <0.5
	 // 	for ( a2=0;a2<=4;a2 +=1 / 2 ** 0 ) { // 0< ( 0.125 ) < / <0.5< // <1.5
		for ( a3=0;a3<=3;a3 +=1 / 2 ** 1 ) { // -1.5 < - ( 1 ) <0 1.375 ?
		for ( a4=3;a4<=9;a4 +=1 / 2 ** 0 ) { // 5< 6 <
		for ( a5=-3;a5<=3;a5 +=1 / 2 ** 0 ) { 
			a2=4;
			alfa[methodNUMBER] = [a0 , a1 , a2 , a3 , a4 , a5];
			console.log ( "alfa[" + methodNUMBER + "]: " , alfa[methodNUMBER] ) ;
	for ( man=2; man<=PlayerMAX;man ++ ) { 
			argv = Array ( man-1 ) .fill ( 0 ) .concat ( Array ( 1 ) .fill ( methodNUMBER ) ) ;
			a = mainloop ( argv ) ; winalfa.push ( [man , a[methodNUMBER].concat ( alfa[methodNUMBER] ) ] ) ;
			if ( a[methodNUMBER]<x715[man-2] ) { console.log ( man , alfa[methodNUMBER] , "\tav_rank: " , a ) ;
			 } else if ( man == 2&&a[methodNUMBER]<x715[man-2] ) { console.log ( man , alfa[methodNUMBER] , "\tav_rank: " , a , rating1500 ( a[methodNUMBER] ) ) ; } 
	 } 
		 } } } } } 
	winmesnum ( winalfa , methodNUMBER , 100 ) ;
 } 

var methodNUMBER=2;alfa[methodNUMBER]=[1.03 , 0 , 0.21875 , -1.3125 , 4.75 , 0];
a = roll_ball ( methodNUMBER , 7 , 0.5 , 10) ;console.log ( a ) ;

 ( ) => { var methodNUMBER=2; // 総マッピング探索
console.clear ( ) ; meswin_num = Array ( AllMethodNum ) .fill ( 0 ) ;winalfa=[];log_Lv=0; , repeat = 10000;
	for ( a0=1.25;a0<1.375;a0 +=1 / 2 ** 5 ) { // 	0.75? ( 1.3125 ) < / <1.5
	 // for ( a1=0;a1<=0;a1 +=1 / 2 ** 4 ) { // -1.0?< ( 0.0 ) < / <0.5
	for ( a2=0;a2<.25;a2 +=1 / 2 ** 5 ) { // 0< ( 0.125 ) < / <0.5< // <1.5
	for ( a3=-1.5;a3<-0.75;a3 +=1 / 2 ** 4 ) { // -1.5 < - ( 1 ) <0 1.375 ?
	for ( a4=4;a4<5;a4 +=1 / 2 ** 4 ) { // 5< 6 <
		a5=0;
		alfa[methodNUMBER]=[a0 , a1 , a2 , a3 , a4 , a5];
		console.log ( "alfa[" + methodNUMBER + "]: " , alfa[methodNUMBER] ) ;
for ( man=2;man<=PlayerMAX;man ++ ) { 
		argv=Array ( man-1 ) .fill ( 0 ) .concat ( Array ( 1 ) .fill ( methodNUMBER ) ) ;
		a=mainloop ( argv ) ; winalfa.push ( [man , a[methodNUMBER]].concat ( alfa[methodNUMBER] ) ) ;
		if ( a[methodNUMBER]<x715[man-2] ) { console.log ( man , alfa[methodNUMBER] , "\tav_rank: " , a ) ;
		 } else if ( man == 2&&a[methodNUMBER]<x715[man-2] ) { console.log ( man , alfa[methodNUMBER] , "\tav_rank: " , a , rating1500 ( a[methodNUMBER] ) ) ; } 
 } 
	 } } } } 
	winmesnum ( winalfa , methodNUMBER , 100 ) ;
 } 

var methodNUMBER=1;alfa[methodNUMBER]=[2.3125 , 7.40625];
a = roll_ball ( methodNUMBER , 7 , 0.5 , 10) ;console.log ( a ) ;

 ( ) => { var methodNUMBER=1	 // 総マッピング探索
console.clear ( ) ; meswin_num = Array ( AllMethodNum ) .fill ( 0 ) ;winalfa=[];log_Lv=0;repeat = 20000;
	for ( a0=2.25;a0<2.5;a0 +=1 / 2 ** 6 ) { // 		<	 ( 2.15 ) 	<
	for ( a1=7.375;a1<=7.5;a1 +=1 / 2 ** 7 ) { // -1.0?< ( 0.0 ) < / <0.5
		alfa1=[a0 , a1];
		console.log ( "alfa: " , alfa1 ) ;
for ( man=2;man<=2;man ++ ) { 
		method=Array ( man-1 ) .fill ( 0 ) .concat ( Array ( 1 ) .fill ( methodNUMBER ) ) ;
		a=mainloop ( ) ; winalfa.push ( [man , a[methodNUMBER]].concat ( alfa1 ) ) ;
		if ( a[methodNUMBER]<x715[man-2] ) { console.log ( man , alfa1 , "\tav_rank: " , a , rating1500 ( a[methodNUMBER] ) ) ; } else { } 
 } 
	 } } 
winmesnum ( winalfa , methodNUMBER , 10 ) ;

 } 

 // 総当たり戦
console.clear ( ) ; meswin_num = Array ( AllMethodNum ) .fill ( 0 ) ;log_Lv=2;repeat = 10000;
for ( man=1;man<=5;man ++ ) { 
	for ( met=0;met<AllMethodNum-1;met ++ ) { 
		for ( met2=met + 1;met2<AllMethodNum;met2 ++ ) { 
			method=Array ( man ) .fill ( met ) .concat ( Array ( man ) .fill ( met2 ) ) ;
			a=mainloop ( ) ;
		 } 
	 } 
 } 
console.log ( meswin_num ) ;

 // 1種総当たり戦
console.clear ( ) ; meswin_num = Array ( AllMethodNum ) .fill ( 0 ) ;log_Lv=2 , repeat = 20000; methodNUMBER=3;
for ( met = 0; met < AllMethodNum ; met++ ) { 
	if ( met == methodNUMBER ) { continue ;} 
	method = Array ( 1 ) .fill ( methodNUMBER ) .concat ( Array ( 1 ) .fill ( met ) ) ;
	a = mainloop ( ) ;
 } 
console.log ( meswin_num ) ;


 // 多人数戦
console.clear ( ) ; meswin_num = Array ( AllMethodNum ) .fill ( 0 ) ;log_Lv=2 , repeat = 20000;var anti = 0; methodNUMBER = 3;
for ( men = 1; men < PlayerMAX ; men++ ) { 
	method = Array ( 1 ) .fill ( methodNUMBER ) .concat ( Array ( men ) .fill ( anti ) ) ;
	a = mainloop ( ) ;
 } 
console.log ( meswin_num ) ;

method = [0,0,0,0,0, 0,0,1,2,3];
a = mainloop ( ) ;
