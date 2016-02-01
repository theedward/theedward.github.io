$(function() {
	var todolist = {}
	todolist.db = {}
	
	// Holding database instance inside a global variable
	todolist.open = function(){
		todolist.db = openDatabase("todolist","1.0","TODOList",5 * 1024 * 1024);
	}
	
	//Will create a table if it doesn't exist already
	todolist.createTable = function(){
		var database = todolist.db;
		database.transaction(function(tx){
			tx.executeSql("CREATE TABLE IF NOT EXISTS todo_list(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, content TEXT)", []);
		});
	}
	
	//Function to be called when database queries fail
	todolist.onError = function(tx, e) {
	  alert("There has been an error: " + e.message);
	}
	
	//Function to be called when database queries succeeed. TODO: Add a toastr notification
	todolist.onSuccess = function(tx, r) {
	  // re-render the data.
	  // loadTodoItems is defined in Step 4a
	}
	
	//When page is in edit mode, fill contents, else hide Delete button
	todolist.fillContent = function() {
		var id = $.QueryString["id"];
		var name = $.QueryString["name"];
		var content = $.QueryString["content"];
		
		if(id > 0 && name !== 'undefined' && content !== 'undefined'){
			$('#name').val(name);
			$('#content').val(content);
		}else
		{
			$('#btn_delete_todo').hide();
		}
	}
	
	//Function that reads the query string. Should be used like: var param = $.QueryString["param"]; returns the param value;
    $.QueryString = (function(query) {
        if (query == "") return {};
        var parameter = {};
        for (var i = 0; i < query.length; ++i)
        {
            var value=query[i].split('=');
            if (value.length != 2) continue;
            parameter[value[0]] = decodeURIComponent(value[1].replace(/\+/g, " "));
        }
        return parameter;
    })(window.location.search.substr(1).split('&'));
	
	//The "main" function
	function init(){
		if(typeof(openDatabase) !== 'undefined')
		{
			todolist.open();
			todolist.createTable();
			todolist.fillContent();
			
		}
		else
		{
			alert('Your browser does not support webSql');
		}
	}init();
	
	//Inserts or Updates (if exists) the Todo in the db. Passing values as parameters
	todolist.addTodo = function(name,content){
		var database = todolist.db;
		var id = $.QueryString["id"];
		
		if(id > 0){
			database.transaction(function(tx){
				tx.executeSql("UPDATE todo_list SET name = ?, content=? WHERE id = ?",
				[name, content, id],
				todolist.onSuccess,
				todolist.onError);
			});
		}else
		{
			database.transaction(function(tx){
				tx.executeSql("INSERT INTO todo_list(name, content) VALUES (?,?)",
				[name, content],
				todolist.onSuccess,
				todolist.onError);
			});
		}
		
	}
	
	//Delete Todo from database given the id
	todolist.deleteTodo = function(id) {
	  var database = todolist.db;
	  database.transaction(function(tx){
	    tx.executeSql("DELETE FROM todo_list WHERE ID=?", [id],
	        todolist.onSuccess,
	        todolist.onError);
	    });
	}
	
	//Create Button OnClick Listener
	$('#btn_create_todo').click(function(){
		var todo_name = $('#name').val();
		var todo_content = $('#content').val();
		
		if(todo_name.length == '' || todo_content.length == '')
		{
			alert('Ambos os campos são obrigatórios');
		}
		else
		{
			todolist.addTodo(todo_name,todo_content);
		}
	});
	
	//Delete Button OnClick Listener
	$('#btn_delete_todo').click(function(){
		var id = $.QueryString["id"];
		
		if(id > 0){
			todolist.deleteTodo(id);
		}
	});
});

		