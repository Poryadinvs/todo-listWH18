let todos = JSON.parse(localStorage.getItem("todos")) ?? [];

const form = document.querySelector("form");
const todo = document.querySelector(".todo");
const todoParent = document.querySelector(".todos");

const deleteButtons = document.querySelectorAll(".remove");
const editButtons = document.querySelectorAll(".edit");

const modal = document.querySelector(".modal");
const modalTitle = modal.querySelector(".title");
const modalButton = modal.querySelector(".buttons");
const checkbox = todo.querySelector('input[type="checkbox"]');
const dropdown = document.querySelector('.dropdown')
const dropdownTrigger = dropdown.querySelector('.dropdown-trigger')
let editingTodo;

form.addEventListener("submit", (event) => {
	event.preventDefault();

	const value = form.querySelector('input').value
	let hasTodo = validate(value)

	if (!hasTodo && editingTodo) {
		let todoElement = document.getElementById(editingTodo.id)

		todoElement.querySelector('.text').textContent =
			value

		todos = todos.map((todo) =>
			todo.id == editingTodo.id
				? { ...todo, title: value } : todo)
		save()
		editingTodo = null

	} else if (!hasTodo) {
		let newTodo = {
			id: new Date().getTime(),
			title: value,
			completed: false,
			dateCreated: new Date()
		}

		showTodo(newTodo)
		todos.push(newTodo)
		save()
		counter()
	}
	form.reset()
	form.querySelector('input').classList.remove('is-danger')
});

dropdown.addEventListener('click', (event) => {
	dropdown.classList.toggle('is-active')
	window.onclick = (e) => {
		if (e.target !== event.target) {
			dropdown.classList.remove('is-active')
		}
	}
})

function showTodo(object) {
	let clone = todo.cloneNode(true);

	clone.setAttribute("id", object.id);

	const status = clone.querySelector(".checkbox");
	const text = clone.querySelector(".text");

	status.checked = object.completed;
	text.textContent = object.title.length <= 25
		? object.title
		: object.title.slice(0, 25) + '...'

	if (status.checked) {
		text.classList.add("is-done");
	}

	clone.querySelector(".checkbox").dataset.id = object.id;
	clone.querySelector(".remove").dataset.id = object.id;
	clone.querySelector(".edit").dataset.id = object.id;

	clone.classList.remove("is-hidden");
	todoParent.append(clone);
	counter()
}

function deleteTodo(id) {
	const handler = () => {
		todos = todos.filter((todo) => todo.id != id);

		document.getElementById(id)
			? document.getElementById(id).remove()
			: null

		modal.classList.remove("is-active");
		save();
		counter()
	}

	showModal(
		"Вы действительно хотите удалить задачу?",
		"Да",
		handler
	);

}

function deleteAll(){
	const handler = () => {
        todos = [];
        localStorage.removeItem("todos");
        todoParent.innerHTML = "";
        modal.classList.remove("is-active");
        counter();
    };

    showModal(
        "Вы действительно хотите удалить все задачи?",
        "Да",
        handler
    );
}

function showModal(title, buttonText, handler = null) {
	modal.classList.toggle("is-active");

	modalTitle.textContent = title;
	const button = document.createElement("button");
	button.className = "button is-info";
	button.textContent = buttonText;
	const close = () => modal.classList.remove('is-active')

	modalButton.innerHTML = ''
	modalButton.append(button)

	button.onclick = handler ?? close

	modal.querySelector('.modal-close').onclick = close

	document.onkeydown = (event) => {
		event.key == "Enter" && handler
			? handler()
			: close
	}

}

function toggleStatus(id) {
	const todoElement = document.getElementById(id);
	const text = todoElement.querySelector(".text");

	text.classList.toggle("is-done");

	todos = todos.map((todo) =>
		todo.id == id ? { ...todo, completed: !todo.completed } : todo
	);
	save();
}
function save() {
	localStorage.setItem("todos", JSON.stringify(todos));
}

function validate(title) {
	let hasTodo = todos.find((object) => object.title === title);


	if (hasTodo && editingTodo && hasTodo.title === editingTodo.title) {
		return false
	} else if (hasTodo) {
		showModal('Такая задача уже существует', 'Ок')
		form.querySelector('input').classList.add('is-danger')

		return true
	}

	return false
}



function finishAll() {
	todos = todos.map((todo) => ({ ...todo, completed: true }))
	save()

	const inputs = document.querySelectorAll('.todo:not(.is-hidden)')

	inputs.forEach((todo) => {
		todo.querySelector('.checkbox').checked = true
		todo.classList.add('is-done')
	})
}


function todoFilter(status = null) {
	let allTodos = JSON.parse(localStorage.getItem('todos'))

	switch (status) {
		case 'Открытые':
			todos = allTodos.filter((todo) => !todo.completed)
			break
		case 'Завершенные':
			todos = allTodos.filter((todo) => todo.completed)
			break
		default:
			todos = allTodos
	}
	todoParent.innerHTML = ''
	todos.forEach((object) => showTodo(object));
	counter()
}

function counter() {
	document.querySelector('.todo-counter').textContent = todos.length
}

function editTodo(id) {
	let targetTodo = todos.find((todo) => todo.id == id)
	form.querySelector('input').value = targetTodo.title

	editingTodo = targetTodo
}

todos.forEach((object) => showTodo(object));
