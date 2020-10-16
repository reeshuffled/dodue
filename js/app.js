const STORAGE_LOCATION = "tasks";

const userGuideLink = document.getElementById("userGuideLink");
const userGuideSection = document.getElementById("userGuide");
const overdueTasksSection = document.getElementById("overdueTasks");
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
    setDefaultDates();

    bindTaskCreationActions();
    bindUserGuideToggle();

    fetchTasks();
})();

/**
 * Bind the onclick action to the user guide link to toggle visibility of help text.
 */
function bindUserGuideToggle() 
{
    userGuideLink.onclick = () => {
        if (userGuideSection.style.display == "none")
        {
            userGuideSection.style.display = "";
        }
        else
        {
            userGuideSection.style.display = "none";
        }
    }
}

/**
 * Add the onclick function to the task creation button UI component.
 */
function bindTaskCreationActions() 
{
    addTaskButton.onclick = createTask;

    // move the due date along with the do date if is is increasing by a small interval (i.e. not being a chosen date from the datepicker)
    let oldDoDate = doDateInput.value;
    doDateInput.onchange = () => {
        // if the date is moved by an interval of one day (i.e. via the arrow keys)
        if (new Date(formatDate(doDateInput.value)).getTime() - new Date(formatDate(oldDoDate)).getTime() == 1000 * 60 * 60 * 24) 
        {
            dueDateInput.value = new Date(new Date(formatDate(dueDateInput.value)).getTime() + 1000 * 60 * 60 * 24).toLocaleDateString("en-CA");
        }

        oldDoDate = doDateInput.value;
    }

    // prevent due date from being set to a date before the do date
    let oldDueDate = dueDateInput.value;
    dueDateInput.onchange = e => {
        if (new Date(formatDate(dueDateInput.value)).getTime() < new Date(formatDate(doDateInput.value)).getTime()) 
        {
            dueDateInput.value = oldDueDate;
        }
        else
        {
            oldDueDate = dueDateInput.value;
        }
    }

    // allow the user to press enter in the task name field to create a new task to speed up task creation
    taskNameInput.onkeydown = e => {
        if (e.key == "Enter")
        {
            createTask();
        }
    }

    // allow the user to press enter in the task do date field to create a new task to speed up task creation
    doDateInput.onkeydown = e => {
        if (e.key == "Enter")
        {
            createTask();
        }
    }

    // allow the user to press enter in the task due date field to create a new task to speed up task creation
    dueDateInput.onkeydown = e => {
        if (e.key == "Enter")
        {
            createTask();
        }
    }
}

/**
 * Create a new task, save it to storage, and display it on screen.
 */
function createTask()
{
    // get task data to create
    const name    = taskNameInput.value;
    const doDate  = formatDate(doDateInput.value);
    const dueDate = formatDate(dueDateInput.value);

    // do not allow blank named tasks
    if (name == "") return;

    // create task object
    const newTask = {
        name: name,
        doDate: doDate,
        dueDate: dueDate
    };

    // add to tasks list
    tasks.push(newTask);

    // re-render tasks
    renderTasks();

    // save tasks to localStorage
    saveTasks();

    // reset name input
    taskNameInput.value = "";

    // reset date inputs
    setDefaultDates();
}

/**
 * Create an HTML representation of the task data and add to the end of 
 * the tasks section.
 * @param {Object} task 
 */
function appendTask(task)
{
    const name = task.name;
    const doDate  = task.doDate || "none";
    const dueDate = task.dueDate || "none";

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

                // re-render the tasks since the due date has changed and will affect sort order and if its do now vs later
                renderTasks();
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

    // create a button that deletes the task when done
    const doneButton = document.createElement("button");
    doneButton.innerText = "i finished!";
    doneButton.onclick = () => {
        // remove the task
        tasks.splice(tasks.indexOf(task), 1);

        // commit to memory the latest action
        saveTasks();

        // re-render tasks
        renderTasks();
    }
    
    // add information components to task div
    taskDiv.appendChild(nameHeader);
    taskDiv.appendChild(doDateEl);
    taskDiv.appendChild(dueDateEl);
    taskDiv.appendChild(doneButton);
    
    // if a task's due date is before today, it is overdue
    const today = formatDate(new Date().toLocaleDateString("en-CA"));
    if (new Date(task.doDate).getTime() < new Date(today).getTime()
                || new Date(task.dueDate).getTime() < new Date(today).getTime())
    {
        document.getElementById("overdue").style.display = "";
        overdueTasksSection.appendChild(taskDiv);
    }
    // if the task's do date is today, put it in the currentTasksSection
    else if (task.doDate == today)
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
 * Add tasks to the screen into their appropriate section.
 */
function renderTasks()
{
    // clear out previous task HTML
    overdueTasksSection.innerHTML = "";
    currentTasksSection.innerHTML = "";
    laterTasksSection.innerHTML = "";

    // sort tasks in by date then alphabetically and add to the screen
    tasks
        .sort((a, b) => {
            const aDate = new Date(a.doDate).getTime();
            const bDate = new Date(b.doDate).getTime();
            
            if (aDate == bDate) 
            {
                return a.name.localeCompare(b.name);
            }
            else
            {
                return aDate - bDate;
            }
        })
        .forEach(task => appendTask(task));

    // check if there are no tasks for today
    checkIfAllTasksDone();
}

/**
 * Check if there are any tasks that are to do today, if not, show the done message.
 */
function checkIfAllTasksDone()
{
    const today = formatDate(new Date().toLocaleDateString("en-CA"));
    
    // hide the overdue section if no tasks are overdue
    if (tasks.filter(x => new Date(x.doDate).getTime() < new Date(today).getTime()).length == 0
        && tasks.filter(x => new Date(x.dueDate).getTime() < new Date(today).getTime()).length == 0)
    {
        document.getElementById("overdue").style.display = "none";
    }

    // if there are no tasks to do today
    if (tasks.filter(x => x.doDate == today).length == 0) 
    {
        currentTasksSection.innerHTML += `
            <div class="task" id="doneAllCurrentTasks">
                <h4 style="margin-top: 0; margin-bottom: 0">you have no more tasks for today :)</h4>
            </div>
        `;
    }
    else
    {
        const allTasksDoneEl = document.getElementById("doneAllCurrentTasks");

        if (allTasksDoneEl)
        {
            currentTasksSection.removeChild(allTasksDoneEl);
        }
    }

    // if there are no tasks to do later
    if (tasks.filter(x => new Date(x.doDate).getTime() > new Date().getTime()).length == 0) 
    {
        laterTasksSection.innerHTML += `
            <div class="task" id="doneAllLaterTasks">
                <h4 style="margin-top: 0; margin-bottom: 0">you have no more tasks for the foreseeable future :)</h4>
            </div>
        `;
    }
    else
    {
        const allTasksDoneEl = document.getElementById("doneAllLaterTasks");

        if (allTasksDoneEl)
        {
            laterTasksSection.removeChild(allTasksDoneEl);
        }
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
    }

    // render tasks that have just been pulled from storage
    renderTasks();
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