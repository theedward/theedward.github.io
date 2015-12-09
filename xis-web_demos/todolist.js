$(function() {
	var todolist = {}
	todolist.init = {}
	todolist.init.db = {}
	
	// Holding database instance inside a global variable
	todolist.init.open = function(){
		todolist.init.db = openDatabase("todolist","1.0","TODOList",5 * 1024 * 1024);
	}
	
	todolist.init.createTable = function(){
		var database = todolist.init.db;
		database.transaction(function(tx){
			tx.executeSql("CREATE TABLE IF NOT EXISTS todo_list(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, content TEXT)", []);
		});
	}
	
	todolist.init.getAllTodoItems = function(renderFunc) {
	  var database = todolist.init.db;
	  database.transaction(function(tx) {
	    tx.executeSql("SELECT * FROM todo_list", [], renderFunc,
	        todolist.init.onError);
	  });
	}
	
	todolist.init.onError = function(tx, e) {
	  alert("There has been an error: " + e.message);
	}
	
	todolist.init.onSuccess = function(tx, r) {
	  // re-render the data.
	  // loadTodoItems is defined in Step 4a
	}
	
	
	
	function init(){
		if(typeof(openDatabase) !== 'undefined')
		{
			todolist.init.open();
			todolist.init.createTable();
			todolist.init.getAllTodoItems(loadTodoItems);
		}
		else
		{
			alert('Your browser does not support webSql');
		}
	}
	
	init();
	
	// passing values as parameters
	todolist.init.addTodo = function(name,content){
		var database = todolist.init.db;
		database.transaction(function(tx){
			tx.executeSql("INSERT INTO todo_list(name, content) VALUES (?,?)",
			[name, content],
			todolist.init.onSuccess,
			todolist.init.onError);
			});
	}
	
	
	
	function loadTodoItems(tx, rs) {
	  var todoItems = document.getElementById("ol_todo_list");
	  for (var i=0; i < rs.rows.length; i++) {
	    renderTodo(rs.rows.item(i), todoItems);
	  }
	}
	
	function renderTodo(row, ol) {
		var li = document.createElement('li');
		var span = document.createElement('span');
		ol.appendChild(li);
		li.appendChild(span);
		li.setAttribute('class','list-group-item');
		span.setAttribute('class', 'badge')
		span.innerHTML = span.innerHTML + row.id;
        li.innerHTML=li.innerHTML + row.name + ": " + row.content;
	}
	
	todolist.init.deleteTodo = function(id) {
	  var database = todolist.init.db;
	  database.transaction(function(tx){
	    tx.executeSql("DELETE FROM todo_list WHERE ID=?", [id],
	        todolist.init.onSuccess,
	        todolist.init.onError);
	    });
	}
	

	$('#btn_create_todo').click(function(){
		var todo_name = $('#name').val();
		var todo_content = $('#content').val();
		
		if(todo_name.length == '' || todo_content.length == '')
		{
			alert('Ambos os campos são obrigatórios');
		}
		else
		{
			todolist.init.addTodo(todo_name,todo_content);
		}
	});
});

		