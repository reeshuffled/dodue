const STORAGE_LOCATION = "tasks";

const currentTasksSection = document.getElementById("currentTasks");
const laterTasksSection = document.getElementById("laterTasks");
const addTaskButton = document.getElementById("addTask");
const taskNameInput = document.getElementById("taskNameInput");
const doDateInput = document.getElementById("doDateInput");
const dueDateInput = document.getElementById("dueDateInput");
const laterTasksToggle = document.getElementById("laterTasksToggle");

const tasks = [];

/**
 * Initialize the UI components of the application.
 */
(function initUI() {
    bindTaskCreationAction();

    setDefaultDates();
    
    fetchTasks();
})();

/**
 * Add the onclick function to the task creation button UI component.
 */
function bindTaskCreationAction() 
{
    addTaskButton.onclick = () => {
        // get task data to create
        const name    = taskNameInput.value;
        const doDate  = formatDate(doDateInput.value);
        const dueDate = formatDate(dueDateInput.value);

        // create task object
        const newTask = {
            name: name,
            doDate: doDate,
            dueDate: dueDate
        };

        // append task to tasks section
        appendTask(newTask);

        // add to tasks list
        tasks.push(newTask);

        // save tasks to localStorage
        saveTasks();

        // reset name input
        taskNameInput.value = "";

        // reset date inputs
        setDefaultDates();
    }
}

/**
 * Set the default dates for do and due date inputs.
 */
function setDefaultDates() 
{
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 1000 * 60 * 60 * 24);

    doDateInput.value = today.toLocaleDateString("en-CA");
    dueDateInput.value = tomorrow.toLocaleDateString("en-CA");
}

/**
 * Create an HTML representation of the task data and add to the end of 
 * the tasks section.
 * @param {Object} task 
 */
function appendTask(task)
{
    const name = task.name;
    const doDate  = task.doDate  ? new Date(task.doDate).toLocaleDateString()  : "none";
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "none";

    const taskDiv = document.createElement("div");
    taskDiv.className = "task";
    
    const nameHeader = document.createElement("h3");
    nameHeader.innerText = name;
    nameHeader.onclick = () => {
        // clear the nameHeader to make room for the input element to edit the name
        nameHeader.innerHTML = "";

        // create input element that auto-populates with previous name to edit
        const inputEl = document.createElement("input");
        inputEl.type = "text";
        inputEl.value = name;
        
        // stop propagation in order to prevent nameHeader clicks to be captured when the input element is on the page
        inputEl.onclick = e => e.stopPropagation();
        inputEl.onkeydown = e => {
            // when the user presses enter, save the new name
            if (e.key == "Enter") {
                // update the name in the display
                nameHeader.innerText = inputEl.value;

                // update the task name in memory and save it
                task.name = inputEl.value;
                saveTasks();
            }
            else if (e.key == "Escape") {
                // revert the name back to its original state
                nameHeader.innerText = name;
            }
        }

        // add the input element to the nameHeader and focus on the input to start
        nameHeader.appendChild(inputEl);
        inputEl.focus();
    }
    
    const doDateEl = document.createElement("p");
    doDateEl.innerHTML = `<b>do date: </b>`;

    const doDateSpan = document.createElement("span");
    doDateSpan.innerText = doDate;

    doDateSpan.onclick = () => {
        // clear the doDateSpan to make room for the input element to edit the date
        doDateSpan.innerHTML = "";

        // create input element that auto-populates with previous do date to edit
        const inputEl = document.createElement("input");
        inputEl.type = "date";
        inputEl.value = new Date(doDate).toLocaleDateString("en-CA");

        // stop propagation in order to prevent doDateSpan clicks to be captured when the input element is on the page
        inputEl.onclick = e => e.stopPropagation();
        inputEl.onkeydown = e => {
            // when the user presses enter, save the new name
            if (e.key == "Enter") {
                // update the do date in the display
                doDateSpan.innerText = formatDate(inputEl.value);

                // update the task name in memory and save it
                task.doDate = formatDate(inputEl.value);
                saveTasks();
            }
            else if (e.key == "Escape") {
                // revert the name back to its original state
                doDateSpan.innerText = doDate;
            }
        }

        // add the input element to the doDateSpan and focus on the input to start
        doDateSpan.appendChild(inputEl);
        inputEl.focus();
    }
    
    doDateEl.appendChild(doDateSpan);

    const dueDateEl = document.createElement("p");
    dueDateEl.innerHTML = `<b>due date: </b>`;

    const dueDateSpan = document.createElement("span");
    dueDateSpan.innerText = dueDate;

    dueDateSpan.onclick = () => {
        // clear the doDateSpan to make room for the input element to edit the date
        dueDateSpan.innerHTML = "";

        // create input element that auto-populates with previous do date to edit
        const inputEl = document.createElement("input");
        inputEl.type = "date";
        inputEl.value = new Date(dueDate).toLocaleDateString("en-CA");
 
        // stop propagation in order to prevent doDateSpan clicks to be captured when the input element is on the page
        inputEl.onclick = e => e.stopPropagation();
        inputEl.onkeydown = e => {
            // when the user presses enter, save the new name
            if (e.key == "Enter") {
                // update the do date in the display
                dueDateSpan.innerText = formatDate(inputEl.value);
 
                // update the task name in memory and save it
                task.dueDate = formatDate(inputEl.value);
                saveTasks();
            }
            else if (e.key == "Escape") {
                // revert the name back to its original state
                dueDateSpan.innerText = dueDate;
            }
        }
 
        // add the input element to the doDateSpan and focus on the input to start
        dueDateSpan.appendChild(inputEl);
        inputEl.focus();
    }

    dueDateEl.appendChild(dueDateSpan);
    
    // add information components to task div
    taskDiv.appendChild(nameHeader);
    taskDiv.appendChild(doDateEl);
    taskDiv.appendChild(dueDateEl);

    console.log(new Date(task.doDate));

    // if the task's do date is today, put it in the currentTasksSection
    if (task.doDate == formatDate(new Date().toLocaleDateString("en-CA")))
    {
        currentTasksSection.appendChild(taskDiv);
    }
    // if task's do date is not today, then put it in the laterTasksSection
    else 
    {
        laterTasksSection.appendChild(taskDiv);
    }
}

/**
 * Take the date format from the date input and transform it into MM/DD/YYYY as a more stable serializable 
 * date format, as well as being the preferred format of Americans.
 * @param {String} dateString 
 */
function formatDate(dateString)
{
    const components = dateString.split("-");

    // take year from beginning and put at end
    components.push(components.shift());

    return components.join("/");
}

/**
 * Save the tasks list to localStorage.
 */
function saveTasks()
{
    localStorage.setItem(STORAGE_LOCATION, JSON.stringify(tasks));
}

/**
 * Get saved tasks from localStorage and display them on-screen.
 */
function fetchTasks()
{
    // if the user has tasks saved
    if (localStorage.getItem(STORAGE_LOCATION))
    {
        // retrieve tasks from localStorage and add to tasks list
        tasks.push(...JSON.parse(localStorage.getItem(STORAGE_LOCATION)));

        // render all tasks
        tasks.forEach(task => appendTask(task));

        // check if there are no tasks for today
        checkIfAllTasksDone();
    }
}

/**
 * Check if there are any tasks that are to do today, if not, show the done message.
 */
function checkIfAllTasksDone()
{
    const today = formatDate(new Date().toLocaleDateString("en-CA"));
    
    if (tasks.filter(x => x.doDate == today).length == 0) {
        currentTasksSection.innerHTML += `
            <div class="task">
                <h4 style="margin-top: 0; margin-bottom: 0">you have no more tasks for today :)</h4>
            </div>
        `;
    }
}