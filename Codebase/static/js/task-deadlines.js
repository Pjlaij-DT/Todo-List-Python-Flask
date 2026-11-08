const deadlineClasses = [
  "bg-gradient-to-r",
  "from-red-200", "via-red-50", "to-white", "border-red-300",
  "from-amber-200", "via-amber-50", "border-amber-300",
  "from-green-200", "via-green-50", "border-green-300",
  "from-slate-50", "border-slate-200"
];

function formatDuration(totalMinutes) {
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const totalDays = totalMinutes / 1440;
  if (totalDays < 1) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (totalDays < 30.436875) {
    const days = Math.floor(totalDays);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    return hours ? `${days}d ${hours}h` : `${days}d`;
  }

  const years = Math.floor(totalDays / 365);
  if (years > 0) {
    const remainingMonths = Math.floor((totalDays - years * 365) / 30.436875);
    return remainingMonths ? `${years}y ${remainingMonths}mo` : `${years}y`;
  }

  const months = Math.floor(totalDays / 30.436875);
  const remainingDays = Math.floor(totalDays - months * 30.436875);
  return remainingDays ? `${months}mo ${remainingDays}d` : `${months}mo`;
}

function updateCountdowns() {
  document.querySelectorAll("[data-countdown]").forEach((timer) => {
    const dueAt = new Date(timer.dataset.dueAt);
    const remainingMs = dueAt.getTime() - Date.now();
    const hoursLeft = remainingMs / 3600000;
    const totalMinutes = Math.ceil(Math.abs(remainingMs) / 60000);
    const timeText = formatDuration(totalMinutes);

    timer.textContent = remainingMs < 0
      ? `Overdue by ${timeText}`
      : remainingMs < 60000
        ? "Due now"
        : `${timeText} left`;

    const card = timer.closest("li");
    card.classList.remove(...deadlineClasses);
    const colorClasses = hoursLeft < 24
      ? ["bg-gradient-to-r", "from-red-200", "via-red-50", "to-white", "border-red-300"]
      : hoursLeft < 48
        ? ["bg-gradient-to-r", "from-amber-200", "via-amber-50", "to-white", "border-amber-300"]
        : hoursLeft < 72
          ? ["bg-gradient-to-r", "from-green-200", "via-green-50", "to-white", "border-green-300"]
          : ["bg-gradient-to-r", "from-slate-50", "to-white", "border-slate-200"];
    card.classList.add(...colorClasses);
  });
}

function setLocalDateTimeValue(input, date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  input.value = localDate.toISOString().slice(0, 16);
}

function initializeDeadlineForms() {
  document.querySelectorAll(".deadline-form").forEach((form) => {
    const dueAt = form.querySelector('[name="due_at"]');
    const offset = form.querySelector('[name="timezone_offset_minutes"]');
    const warning = form.querySelector("[data-past-warning]");
    const utcValue = dueAt.dataset.utcValue;

    if (utcValue) {
      const savedDate = new Date(utcValue);
      if (!Number.isNaN(savedDate.getTime())) {
        setLocalDateTimeValue(dueAt, savedDate);
      }
    }

    function updateWarning() {
      if (!dueAt.value) {
        warning.hidden = true;
        return;
      }
      const selectedDate = new Date(dueAt.value);
      warning.hidden = Number.isNaN(selectedDate.getTime()) || selectedDate.getTime() >= Date.now();
    }

    function setTimezoneOffset() {
      offset.value = dueAt.value
        ? new Date(dueAt.value).getTimezoneOffset()
        : new Date().getTimezoneOffset();
    }

    dueAt.addEventListener("input", updateWarning);
    dueAt.addEventListener("change", updateWarning);
    form.addEventListener("submit", setTimezoneOffset);
    updateWarning();
    setTimezoneOffset();
  });

  const taskDialog = document.querySelector("#add-task-dialog");
  const openDialogButton = document.querySelector("[data-open-task-dialog]");
  if (taskDialog && openDialogButton) {
    openDialogButton.addEventListener("click", () => taskDialog.showModal());
  }
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.querySelectorAll("[data-close-task-dialog]").forEach((button) => {
      button.addEventListener("click", () => dialog.close());
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  });

  document.querySelectorAll("[data-local-time]").forEach((element) => {
    const dueAt = new Date(element.dateTime);
    if (!Number.isNaN(dueAt.getTime())) {
      element.textContent = dueAt.toLocaleString();
    }
  });
}

function updateTaskCount() {
  const taskList = document.querySelector("[data-task-list]");
  const count = taskList.querySelectorAll("[data-task-card]").length;
  document.querySelector("[data-task-count]").textContent = `${count} total`;
  taskList.hidden = count === 0;
  document.querySelector("[data-empty-state]").hidden = count !== 0;
}

function sortTaskCards() {
  const taskList = document.querySelector("[data-task-list]");
  const cards = [...taskList.querySelectorAll("[data-task-card]")];
  cards.sort((left, right) => {
    const leftDue = left.dataset.dueAt ? new Date(left.dataset.dueAt).getTime() : Number.POSITIVE_INFINITY;
    const rightDue = right.dataset.dueAt ? new Date(right.dataset.dueAt).getTime() : Number.POSITIVE_INFINITY;
    return leftDue - rightDue || Number(left.dataset.taskId) - Number(right.dataset.taskId);
  });
  cards.forEach((card) => taskList.append(card));
}

function cardFromResponse(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

async function submitTaskForm(form, onSuccess) {
  const response = await fetch(form.action, {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "The task could not be saved.");
  }
  onSuccess(result);
}

function initializeTaskActions() {
  const taskList = document.querySelector("[data-task-list]");
  const addDialog = document.querySelector("#add-task-dialog");
  const editDialog = document.querySelector("#edit-task-dialog");
  const editForm = document.querySelector("[data-edit-task-form]");

  document.querySelector("[data-add-task-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await submitTaskForm(form, (result) => {
        taskList.append(cardFromResponse(result.card_html));
        sortTaskCards();
        updateTaskCount();
        updateCountdowns();
        addDialog.close();
        form.reset();
        form.querySelector("[data-past-warning]").hidden = true;
      });
    } catch (error) {
      window.alert(error.message);
    }
  });

  taskList.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-task]");
    if (!editButton) {
      return;
    }
    try {
      const response = await fetch(editButton.dataset.editUrl, {
        headers: { Accept: "text/html" }
      });
      if (!response.ok) {
        throw new Error("The task could not be loaded for editing.");
      }
      const page = new DOMParser().parseFromString(await response.text(), "text/html");
      const taskCard = editButton.closest("[data-task-card]");
      editForm.action = editButton.dataset.editUrl;
      editForm.elements.title.value = page.querySelector("#title").value;
      editForm.elements.description.value = page.querySelector("#description").value;
      editForm.elements.due_at.dataset.utcValue = taskCard.dataset.dueAt;
      setLocalDateTimeValue(
        editForm.elements.due_at,
        new Date(taskCard.dataset.dueAt)
      );
      editForm.elements.timezone_offset_minutes.value = new Date(
        editForm.elements.due_at.value
      ).getTimezoneOffset();
      editForm.querySelector("[data-past-warning]").hidden =
        new Date(editForm.elements.due_at.value).getTime() >= Date.now();
      editDialog.showModal();
      editForm.elements.title.focus();
    } catch (error) {
      window.alert(error.message);
    }
  });

  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await submitTaskForm(editForm, (result) => {
        const oldCard = taskList.querySelector(`[data-task-id="${result.id}"]`);
        oldCard.replaceWith(cardFromResponse(result.card_html));
        sortTaskCards();
        updateTaskCount();
        updateCountdowns();
        editDialog.close();
      });
    } catch (error) {
      window.alert(error.message);
    }
  });

  taskList.addEventListener("submit", async (event) => {
    const form = event.target.closest("[data-delete-task]");
    if (!form) {
      return;
    }
    event.preventDefault();
    if (!window.confirm("Delete this task?")) {
      return;
    }
    try {
      await submitTaskForm(form, (result) => {
        taskList.querySelector(`[data-task-id="${result.id}"]`).remove();
        updateTaskCount();
      });
    } catch (error) {
      window.alert(error.message);
    }
  });
}

initializeDeadlineForms();
initializeTaskActions();
updateCountdowns();
window.setInterval(updateCountdowns, 60000);
