var CurrDataMap = {};
var CurrCompId = "";

var TreeData = null;
var SelForCenterType = null;	//1=数据中心    2=资源中心    3=网络区域
var SelForCenterId = null;

var mouseenter = false;

var CurrentPageNum = 1;

var GridAddId = 1;

var centerSize = 0;
var visitSize =0;
var slaveSize = 0;

function init() {
	initData(function() {
		initComponent();
		initListener();
		initFace();
		query();
	});
	
}


function initData(cb) {
	CurrentPageNum = PRQ.get("pageNum");
	if(CU.isEmpty(CurrentPageNum)){
		CurrentPageNum = 1;
	}
	RS.ajax({url:"/res/computer/getComputerRegionDropListMap",ps:{addEmpty:true, addAttr:true},cb:function(result) {
		DROP["DV_COMP_ROOM_CODE"] = result["room"];
		DROP["DV_DATA_CENTER_CODE"] = result["dc"];
		DROP["DV_RES_CENTER_CODE"] = result["rc"];
		DROP["DV_NET_ZONE_CODE"] = result["nc"];
		var dropList = [];
		for(var i=1; i<result["dc"].length; i++) dropList.push(result["dc"][i]);
		for(var i=1; i<result["rc"].length; i++) dropList.push(result["rc"][i]);
		for(var i=1; i<result["nc"].length; i++) dropList.push(result["nc"][i]);
		TreeData = toTreeData(dropList);
		
		var roomselhtml = PU.getSelectOptionsHtml("DV_RES_CENTER_CODE");
		$("#sel_resCenter").html(roomselhtml);
		$("#sel_resCenter").find("option").first().hide();
		if(CU.isFunction(cb))cb();
	}});

	
}
function initComponent() {

}
function initListener() {
//	$("#btn_init").bind("click", initResCenter);
//	$("#sel_resCenter").bind("change", function() {
//		query();
//	});
	$("#btn_query").bind("click", function() {
		query();
	});

}
function initFace() {
}
function query(){
	var resId = "";
	resId=$('#sel_resCenter :selected').val();
	if(resId=="") return ;
	RS.ajax({url:"/res/computer/queryByResCenter",ps:{resCenterId : resId},cb:function(result) {
		alert(result.initStatus);
		if(result.initStatus==1) {
			$('#initStatus').html("已初始化");
			$('#btn_init').attr("disabled",true);
			$('#btn_init').attr("style","background: #D3D3D3");
		}else{
			$('#initStatus').html("");
			$('#btn_init').removeAttr("style");
			$('#btn_init').attr("disabled",false);
		}
		
		$('#pcComputerTable').html("");
		var slavePartList = result.slavePartList;
		var masterPartList = result.corePartList;
		var visitPartList = result.visitPartList;
		var computerList = result.computerList;
		centerSize = result.corePartList==null?0:masterPartList.length;
		visitSize = result.visitPartList==null?0:visitPartList.length;
		slaveSize = result.slavePartList==null?0:slavePartList.length;

		$('#pcComputerTable-tmpl').tmpl(result).appendTo("#pcComputerTable");

	}});
}

//function initResCenter(){
//	$('#div-log').show();
//	startGetLog();
//	var resId = $('#sel_resCenter :selected').val();
//	RS.ajax({url:"/res/resc/initResCenter",ps:{resCenterId:resId,useAgent:true,loadOnly:true},cb:function(result) {
//		if(result.resultCode.equal("000000")){
//			alert("初始化成功！");
//		}else {
//			alert("初始化安装失败！！！");
//		}
//	}});
//}

//刷新日志
var intervalTime;
function startGetLog() {
		/*轮询*/
		queryLog();
		intervalTime = setInterval(function() {
			queryLog();
	}, 5000);
}
function queryLog() {
	var resId = $('#sel_resCenter :selected').val();
	RS.ajax({url:"/res/resc/getInitLog",ps:{resCenterId:resId},cb:function(msg) {
		if(CU.isEmpty(msg)) return;
		if (msg.length != 0) {
			var str = '';
			var d = msg;
			for (var i = 0; i < d.length; i++) {
				str += d[i].finishTime + '  日志信息:   ' + d[i].desc+ '\n';
			}
			var html =  str;
			$('#logWindow').html('');
			$('#logWindow').html(html);
			$("#logWindow").scrollTop($("#logWindow")[0].scrollHeight);
			return;
		}
	}});
}


function toTreeData(dropList) {
	var tree = [{}];
	var pnobj = {};
	for(var i=0; i<dropList.length; i++) {
		var item = dropList[i];
		var type = item.param1;
		
		item.id = item.code;
		item.text = item.name;
		
		pnobj[item.code+"_"+type] = item;
		
		if(type == "1") {
			item.icon = "fa fa-database";
			tree.push(item);
		}else {
			item.icon = type=="2" ? "fa fa-sitemap" : "fa fa-flash";
			var pn = pnobj[item.parentCode+"_"+(parseInt(type, 10)-1)];
			if(CU.isEmpty(pn)) continue ;
			if(CU.isEmpty(pn.childNodes)) pn.childNodes = [];
			pn.childNodes.push(item);
		}
	}
	return tree;
}
