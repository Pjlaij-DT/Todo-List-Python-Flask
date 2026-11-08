make a step by step implementation guide to creating a todo-list app with python, minimum features add, edit, delete tasks, mark tasks as complete, postgresql storage

ok create checklist.md detailing step by step implementation

following step 1 and prepare the project

finished with step 2, commence step 3

commence 4 to 6

continue 7 and 8

let's get to 9

PS D:\Dev-ing\TEST\todo-app> python app.py
Traceback (most recent call last):
  File "D:\Dev-ing\TEST\todo-app\app.py", line 4, in <module>
    from flask import Flask, abort, redirect, render_template, request, url_for
ModuleNotFoundError: No module named 'flask'

ok let's add some life into this UI, add tailwindcss into our flask app, add a task description, time to complete and a by the hour timer (change the background color of each task based on hours left: red under 24, yellow: under 48, green: under 72), add these as the 11th step in our check list first

looks good, let's commit step 11

ok, now add a warning if the user set due date and time in the past (but still permit it) add a logic to convert remaining hour to days (months and years if long enough)

ok add a gradient to the red, green, yellow color to signify the urgency

auto sort the task based on due date and put the add task into a pop up window (with the +Add button next to Your tasks title)

do the same to the edit panel, let's keep this app as simple to use as possible, and on update and delete, dont refresh the page,

