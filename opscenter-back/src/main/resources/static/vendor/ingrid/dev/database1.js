title = ["新增数据源","编辑数据源"];
	var manifest = {
			params:{delay:10},
			id:"en.AllControls",
			init: function ($form, form) {
				var that = this;
				that.HTML($form);
			},
			ui:{
				"#poolName":"poolName",
				"#driverClassName":"driverClassName",
				"#jdbcUrl" :"jdbcUrl",
				"#username" :"username",
				"#password" :"password",
				"#maximumPoolSize":"maximumPoolSize",
				"#connectionTimeout" :"connectionTimeout",
				"#minimumIdle" :"minimumIdle",
				"#idleTimeout" :"idleTimeout"
			},
			HTML: function ($form) {
				$form.formgen([
					{
						row:"100%",// label:"130px", 
					 	rowCss:"my-row cb pt5 pb5", 
					 	labelCss:"my-label col-sm-3"
					},	
					//['${keymap.zhongxin}', 'sel#zhongxin.w200.h25', rulebookJson.data.zhongxin],
					['数据源名称', 'inp#poolName.h25.col-sm-7', {plc:""}],
					['驱动名称', 'inp#driverClassName.h25.col-sm-7', {plc:""}],
					['链接地址', 'inp#jdbcUrl.h25.col-sm-7', {plc:""}],
					['用户名', 'inp#username.h25.col-sm-7', {plc:""}],
					['密码', 'inp#password.h25.col-sm-7', {plc:""}],
					['最大连接数', 'inp#maximumPoolSize.h25.col-sm-7', {plc:""}],
					['超时时间', 'inp#connectionTimeout.h25.col-sm-7', {plc:""}],
					['最小连接数', 'inp#minimumIdle.h25.col-sm-7', {plc:""}],
					['超时时间', 'inp#idleTimeout.h25.col-sm-7', {plc:""}],
					[' ', '<input type="button" onclick="submitRow()" value = "提交" class="w200 fs90">', {plc:""}]
				]);
			}
		};
	function submitRow(){
		that = this;
		switch(editStatus){
			case 0:
			 $.ajax({
                    dataType: "json",
                    type: "POST",
                    async: true,
                    url: "/dev/createmethod",                                              
                    data: that.row,
                    success: function (changes) {
                    	message(changes);
                    	$grid.pqGrid("refreshDataAndView");
                    }
                });
				break;
			case 1:
				$.ajax({
                    dataType: "json",
                    type: "POST",
                    async: true,
                    url: "/dev/updatemethod",
                    data : that.row,
                    success: function (changes) {
                    	message(changes);
                    	$grid.pqGrid("refreshDataAndView");
                    }
                });
				break;
		}
	}
	 $(function () {
			$('#grid_editing').bind('keyup', function(event) {
		        if (event.keyCode == "13") {
		            //回车执行查询
		        	searchChanges();
		        }
		    });
			 function searchChanges(){
				 $grid.pqGrid("refreshDataAndView");
			 }
			 function addChanges(){
				editStatus = 0;
				$("#formTile").html(title[editStatus]);
				clearRow();
            	$form.my("data",row);
			 }
			 function deleteChanges(){
                 var selarray = $grid.pqGrid('selection', { type: 'row', method: 'getSelection' }),
				 ids = [];
	             for (var i = 0, len = selarray.length; i < len; i++) {
	                 var rowData = selarray[i].rowData;
	                 ids.push(rowData.methodId);
	             }
	             console.info(ids);
	           	 $.ajax({
                    dataType: "json",
                    type: "POST",
                    async: true,
                    url: "/dev/deletemethod",
                    data : {methodIds:ids.join(',')},
                    success: function (changes) {
                    	$grid.pqGrid("refreshDataAndView");
                    }
                }); 
			 }
	        //called when save changes button is clicked.
	        function saveChanges() {
	            var grid = $grid.pqGrid('getInstance').grid;

	            //debugger;
	            //attempt to save editing cell.
	            if (grid.saveEditCell() === false) {
	                return false;
	            }

	            var isDirty = grid.isDirty();
	            if (isDirty) {
	                //validate the new added rows.                
	                var addList = grid.getChanges().addList;
	                //debugger;
	                for (var i = 0; i < addList.length; i++) {
	                    var rowData = addList[i];
	                    var isValid = grid.isValid({ "rowData": rowData }).valid;
	                    if (!isValid) {
	                        return;
	                    }
	                }
	                var changes = grid.getChanges({ format: "byVal" });

	                //post changes to server 
	                $.ajax({
	                    dataType: "json",
	                    type: "POST",
	                    async: true,
	                    beforeSend: function (jqXHR, settings) {
	                        grid.showLoading();
	                    },
	                    url: "/pro/products/batch", //for ASP.NET, java                                                
	                    data: { list: JSON.stringify(changes) },
	                    success: function (changes) {
	                        //debugger;
	                        grid.commit({ type: 'add', rows: changes.addList });
	                        grid.commit({ type: 'update', rows: changes.updateList });
	                        grid.commit({ type: 'delete', rows: changes.deleteList });
	                        grid.history({ method: 'reset' });
	                    },
	                    complete: function () {
	                        grid.hideLoading();
	                    }
	                });
	            }
	        }
	        var obj = {
	        	selectionModel: { type: null },
	        	height:'100%',
	        	wrap: false,
	            hwrap: false,
	            resizable: true,
	            rowBorders: false,
	            virtualX: true,
	            freezeCols: 2,
	            filterModel: { header: true, type: 'remote' },
	            trackModel: { on: true }, //to turn on the track changes.            
	            toolbar: {
	                items: [{ type: 'button', icon: 'ui-icon-plus', label: '新增', cls: 'changes', listener:{
		                		"click": function (evt, ui) {
		                            addChanges();
		                        }
		                       }
		                    },
		                    { type: 'button', icon: 'ui-icon-trash', label: '删除', cls: 'changes', listener:{
		                		"click": function (evt, ui) {
		                            deleteChanges();
		                        }
		                       }
		                    },
		                    { type: 'button', icon: 'ui-icon-refresh', label: '刷新', cls: 'changes', listener:{
	                		"click": function (evt, ui) {
	                            searchChanges();
	                        }
	                       }
	                    }
	                ]
	            },
	            title: "数据源列表",
	            history: function (evt, ui) {
	                var $grid = $(this);
	                if (ui.canUndo != null) {
	                    $("button.changes", $grid).button("option", { disabled: !ui.canUndo });
	                }
	                if (ui.canRedo != null) {
	                    $("button:contains('Redo')", $grid).button("option", "disabled", !ui.canRedo);
	                }
	                $("button:contains('Undo')", $grid).button("option", { label: 'Undo (' + ui.num_undo + ')' });
	                $("button:contains('Redo')", $grid).button("option", { label: 'Redo (' + ui.num_redo + ')' });
	            },
	            colModel: [
	            	 { title: "", dataIndx: "state", maxWidth: 30, minWidth: 30, align: "center",
	                     cb: { header: true, all: false },
	                     type: 'checkBoxSelection', cls: 'ui-state-default', resizable: false, sortable: false, editable: false
	                 },
	            	{ title: "数据源名称", dataType: "string", dataIndx: "poolName", editable: false, width: 80,refresh:false,
	            		filter: { type: 'textbox', condition: 'begin', listeners: ['change'] },
	                    validations: [
	                        { type: 'minLen', value: 1, msg: "Required" },
	                        { type: 'maxLen', value: 40, msg: "length should be <= 40" }
	                    ]	
	            	},
	            	{ title: "驱动名称", dataType: "string", dataIndx: "driverClassName", editable: false, width: 160,refresh:false,
	            		filter: { type: 'textbox', condition: 'begin', listeners: ['change'] },
	                    validations: [
	                        { type: 'minLen', value: 1, msg: "Required" },
	                        { type: 'maxLen', value: 40, msg: "length should be <= 40" }
	                    ]	
	            	},
	            	{ title: "链接地址", dataType: "string", dataIndx: "jdbcUrl", editable: false, width: 600 },
	            	{ title: "用户名", dataType: "string", dataIndx: "username", editable: false, width: 80 },
	            	{ title: "密码", dataType: "string", dataIndx: "password", editable: false, width: 80 },
	            	{ title: "最大连接数", dataType: "integer", dataIndx: "maximumPoolSize", editable: false, width: 80 },
	            	{ title: "超时时间", dataType: "integer", dataIndx: "connectionTimeout", editable: false, width: 80 },
	            	{ title: "最小连接数", dataType: "integer", dataIndx: "minimumIdle", editable: false, width: 80 },
	            	{ title: "超时时间", dataType: "integer", dataIndx: "idleTimeout", editable: false, width: 80 },

	            ],
	            pageModel: { type: "remote", rPP: 20 },
	            dataModel: {
	                dataType: "JSON",
	                location: "remote",
	                recIndx: "poolName",
	                sortIndx: ["poolName"],
	                sortDir: ["up"],
	                getUrl: function(){
	                    return { url: "/grid", data: {type:"autoGrid",pq_method:"databaseList"} }
	                },
	                getData: function (response) {
	                	console.info(response);
	                    return response;
	                }
	            },
	            change: function (evt, ui) {                
	                //refresh the filter.
	                if (ui.source != "add") {
	                    $grid.pqGrid("filter", { oper: 'add', data: [] });
	                }
	            },
	            create: function( event, ui ) {
	            },
	            load: function( event, ui ) {
	            },
	            rowDblClick: function( event, ui ) {
	            	editStatus = 1
	            	changeTitle();
	            	setRow(ui.rowData);
	            	$form.my("data",row);
	            },
	            refresh: function () {
	                $("#grid_editing").find("button.delete_btn").button({ icons: { primary: 'ui-icon-scissors'} })
	                .unbind("click")
	                .bind("click", function (evt) {
	                    var $tr = $(this).closest("tr");
	                    var obj = $grid.pqGrid("getRowIndx", { $tr: $tr });
	                    var rowIndx = obj.rowIndx;
	                    $grid.pqGrid("addClass", { rowIndx: rowIndx, cls: 'pq-row-delete' });

	                    var ans = window.confirm("Are you sure to delete row No " + (rowIndx + 1) + "?");
	                    $grid.pqGrid("removeClass", { rowIndx: rowIndx, cls: 'pq-row-delete' });
	                    if (ans) {
	                        $grid.pqGrid("deleteRow", { rowIndx: rowIndx });
	                    }
	                });
	            },
	        };
	        $grid = $("#grid_editing").pqGrid(obj);
	        $form = $("#dataform").my(manifest,row);
	        $(".grid_form").niceScroll({
			    touchbehavior:false,     //是否是触摸式滚动效果
			    cursorcolor:"#000",     //滚动条的颜色值
			    cursoropacitymax:0.2,   //滚动条的透明度值
			    cursorwidth:5,         //滚动条的宽度值
			    autohidemode:false,      //滚动条是否是自动隐藏，默认值为 true
			});
	        changeTitle();
	    });