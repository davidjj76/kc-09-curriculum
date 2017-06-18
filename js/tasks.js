$(document).ready(function() {

    var API_URL = 'http://localhost:8000/api/';
    var tasks = [];

    var newTaskNameInput = $('#newTaskName');
    newTaskNameInput.focus();

    var tasksLists = {
        true: $('#doneTasksList'),
        false: $('#todoTasksList')
    }
    var loader = $('#tasks-loader');

    var showLoader = function(xhr) {
        loader.show();
    }

    var hideLoader = function() {
        loader.fadeOut();
    }

    var getTasksByState = function(completed) {
        return $.grep(tasks, function(task) {
            return task.completed == completed;
        });
    };

    var getTaskById = function(id) {
        return $.grep(tasks, function(task) {
            return task.id == id;
        })[0];
    };

    var removeTaskById = function(id) {
        return $.grep(tasks, function(task) {
            return task.id != id;
        });
    };

    var renderTooltip = function(text) {
        return '<span class="tooltip">' + text + '</span>'
    }

    var renderTask = function(task) {
        var taskListItem = '<li class="task-item" data-task-id="' + task.id + '">';
        taskListItem += '<input type="checkbox" id="completeTask-' + task.id + '" class="complete-task" '
        taskListItem += (task.completed ? 'checked' : '') + '/>';
        taskListItem += '<label for="completeTask-' + task.id + '"';
        if (task.completed) {
            taskListItem += ' class="completed">';
            taskListItem += renderTooltip('Reinicia esta tarea');
            taskListItem += '<i class="fa fa-check fa-2x" aria-hidden="true"></i>';
        } else {
            taskListItem += '>';
            taskListItem += renderTooltip('Termina esta tarea');
        }
        taskListItem += '</label>';
        taskListItem += '<span id="task-name-' + task.id + '">';
        taskListItem += task.name;
        taskListItem += '<textarea type="text" id="modify-task-' + task.id + '" class="modify-task"/>';
        taskListItem += '</span>';
        taskListItem += '<button class="delete-task">';
        taskListItem += renderTooltip('Borra esta tarea');
        taskListItem += '<i class="fa fa-trash fa-2x" aria-hidden="true"></i>';
        taskListItem += '</button>';
        taskListItem += '</li>';
        return taskListItem;
    };

    var refreshTask = function(id, name) {
        var span = $('#task-name-' + id);
        var input = $('#modify-task-' + id);
        span.contents().filter(function() {
            return this.nodeType == 3
        }).each(function() {
            this.textContent = name;
        });
        input.val('');
        input.hide();
        span.css('color', '#323336');
    }

    var drawNoTasks = function(tasksList) {
        var taskListItem = '<li class="task-item no-tasks">';
        if (tasksList === tasksLists[true]) {
	        taskListItem += 'No he terminado nada';
	    } else {
	        taskListItem += 'No tengo tareas pendientes';	    	
	    }
        taskListItem += '</li>';
        tasksList.append(taskListItem);
    };

    var drawTasksList = function(completed) {
        var tasks = getTasksByState(completed);
        var tasksList = tasksLists[completed];
        var tasksListItems = '';
        tasksList.empty();
        if (tasks.length == 0) {
            drawNoTasks(tasksList);
        } else {
            for (var i = 0; i < tasks.length; i++) {
                tasksListItems += renderTask(tasks[i]);
            }
            tasksList.append(tasksListItems);
        }
    };

    var searchPreviousTaskItem = function(tasksList, taskId) {
        var previousTaskItem;
        tasksListItems = tasksList.children('li');
        for (var i = 0; i < tasksListItems.length; i++) {
            var itemTaskId = $(tasksListItems[i]).data('taskId');
            if (taskId > itemTaskId) {
                previousTaskItem = $(tasksListItems[i]);
            }
        }
        return previousTaskItem;
    };

    var insertTask = function(tasksList, task) {
        var previousTaskItem = searchPreviousTaskItem(tasksList, task.id);
        if (previousTaskItem) {
            previousTaskItem.after(renderTask(task));
        } else {
            tasksList.prepend(renderTask(task));
        }
    };

    var drawTaskItem = function(newTask) {
        var tasksList = tasksLists[newTask.completed];
        if (getTasksByState(newTask.completed).length == 1) {
            tasksList.empty();
        }
        insertTask(tasksList, newTask);
    };

    var removeTaskItem = function(deletedTask, previousCompleted) {
        var taskItem = $('li.task-item[data-task-id=' + deletedTask.id + ']');
        if (taskItem) {
        	taskItem.hide('slow', function() { taskItem.remove(); });
            var taskCompleted;
            if (previousCompleted === undefined) {
                taskCompleted = deletedTask.completed;
            } else {
                taskCompleted = previousCompleted;
            }
            if (getTasksByState(taskCompleted).length == 0) {
                drawNoTasks(tasksLists[taskCompleted]);
            }
        }
    };

    var getTasks = function() {
        $.ajax({
                type: 'GET',
                url: API_URL + 'tasks',
                beforeSend: showLoader
            })
            .done(function(data, textStatus, jqXHR) {
                tasks = data;
                drawTasksList(false);
                drawTasksList(true);
            })
            .fail(function(jqXHR, textStatus, error) {
                console.log('fail:', jqXHR, textStatus, error);
            })
            .always(function() {
            	hideLoader();
            });
    };

    var createTask = function(name) {
        $.ajax({
                type: 'POST',
                url: API_URL + 'tasks',
                data: JSON.stringify({ name: name, completed: false }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                dataType: 'json',
                contentType: 'application/json',
                beforeSend: showLoader
            })
            .done(function(data, textStatus, jqXHR) {
                newTaskNameInput.val('');
                tasks.push(data);
                drawTaskItem(data);
            })
            .fail(function(jqXHR, textStatus, error) {
                console.log('fail:', jqXHR, textStatus, error);
            })
            .always(function() {
            	hideLoader();
            });
    };

    var updateTask = function(id, name, completed) {
        $.ajax({
                type: 'PUT',
                url: API_URL + 'tasks/' + id,
                data: JSON.stringify({ name: name, completed: completed }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                dataType: 'json',
                contentType: 'application/json',
                beforeSend: showLoader
            })
            .done(function(data, textStatus, jqXHR) {
                var storedTask = getTaskById(id);
                var storedCompleted = storedTask.completed;
                tasks[tasks.indexOf(storedTask)] = data;
                if (storedCompleted != data.completed) {
                    removeTaskItem(data, storedCompleted);
                    drawTaskItem(data);
                } else {
                    refreshTask(id, name);
                }
            })
            .fail(function(jqXHR, textStatus, error) {
                refreshTask(id, name);
                console.log('fail:', jqXHR, textStatus, error);
            })
            .always(function() {
            	hideLoader();            	
            });
    };

    var deleteTask = function(id) {
        $.ajax({
                type: 'DELETE',
                url: API_URL + 'tasks/' + id,
                beforeSend: showLoader                
            })
            .done(function(data, textStatus, jqXHR) {
                var deletedTask = getTaskById(id);
                tasks = removeTaskById(id);
                removeTaskItem(deletedTask);
            })
            .fail(function(jqXHR, textStatus, error) {
                console.log('fail:', jqXHR, textStatus, error);
            })
            .always(function() {
            	hideLoader();            	
            });
    };

    newTaskNameInput.on('keypress', function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            if (newTaskNameInput.val() != '') {
                createTask(newTaskNameInput.val());
            }
        }
    });

    var getTaskId = function(element) {
        return $(element).parents('li.task-item').data('taskId');
    }

    $(document).on('click', 'button.delete-task', function(event) {
        var taskId = getTaskId(this);
        deleteTask(taskId);
    });

    $(document).on('change', 'input.complete-task', function(event) {
        var taskId = getTaskId(this);
        var task = getTaskById(taskId);
        updateTask(taskId, task.name, $(this).prop('checked'));
    });

    $(document).on('click', '.task-item > span', function(event) {
        if (event.target.nodeName.toLowerCase() == 'textarea') {
            event.stopPropagation();
            return;
        }
        var taskId = getTaskId(this);
        var task = getTaskById(taskId);
        $(this).css('color', 'transparent');
        var inputText = $(this).children('textarea');
        inputText.val(task.name);
        inputText.show();
        inputText.focus();
    });

    $(document).on('keypress focusout keyup', '.modify-task', function(event) {
        var code = event.keyCode || event.which;
        var ok = event.type == 'keypress' && code == 13;
        var cancel = event.type == 'focusout' || (event.type == 'keyup' && code == 27);

        if (!ok && !cancel) {
            return;
        }

        var taskId = getTaskId(this);
        var task = getTaskById(taskId);
        if (cancel || $(this).val() == '' || $(this).val() == task.name) {
            refreshTask(taskId, task.name);
        } else {
            // Modificamos la tarea
            updateTask(taskId, $(this).val(), task.completed);            
        }
    });

    getTasks();

});
