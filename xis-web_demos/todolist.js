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
	
	//Queries the database to get all elements and calls a function -> renderFunc on the set
	todolist.getAllTodoItems = function(renderFunc) {
	  var database = todolist.db;
	  database.transaction(function(tx) {
	    tx.executeSql("SELECT * FROM todo_list", [], renderFunc,
	        todolist.onError);
	  });
	}
	
	//Asks for user confirmation and if positive, drops the table and refreshes the page
	todolist.dropTable = function(){
		if (confirm('Queres mesmo apagar TODAS as notas?')) {
			// Drop Table!
    		var database = todolist.db;
			database.transaction(function(tx){
			tx.executeSql("DROP TABLE todo_list", []);
			});
			
			location.reload();
		} else {
		    // Do nothing!
		}	
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
	
	//The "main" function
	function init(){
		if(typeof(openDatabase) !== 'undefined')
		{
			todolist.open();
			todolist.createTable();
			todolist.getAllTodoItems(hideDeleteAllButton);
			todolist.getAllTodoItems(loadTodoItems);
		}
		else
		{
			alert('Your browser does not support webSql');
		}
	}init();
	
	
	//Iterate through the set and call the function that knows how to print the Todo on each element
	function loadTodoItems(tx, rs) {
	  var todoItems = document.getElementById("ol_todo_list");
	  for (var i=0; i < rs.rows.length; i++) {
	    renderTodo(rs.rows.item(i), todoItems);
	  }
	}
	
	//If there are no Todos hide the DeleteAll button
	function hideDeleteAllButton(tx, rs) {
		if(rs.rows.length == 0){
			$('#btn_delete_all').hide();
		}
	}
	
	//Find the ol, each Todo is an <li> surrounded by an <a> with a <span> with the id inside
	function renderTodo(row, ol) {
		var a = document.createElement('a');
		var li = document.createElement('li');
		var span = document.createElement('span');
		
		ol.appendChild(a);
		a.appendChild(li);
		li.appendChild(span);
		
		a.setAttribute('href', "todolist_detail.html?name=" + row.name + "&content=" + row.content + "&id=" + row.id);
		a.setAttribute('class', 'list-group-item')
		li.setAttribute('class','list-group-item');
		span.setAttribute('class', 'badge')
		span.innerHTML = span.innerHTML + row.id;
        li.innerHTML=li.innerHTML + row.name + ": " + row.content;
	}
	
	//OnClick listener for DeleteAll button
	$('#btn_delete_all').click(function(){
		todolist.dropTable();
	});
});

		