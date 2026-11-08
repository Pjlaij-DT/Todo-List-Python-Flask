- The problem: 
    Creating a Todo-list App using any language and framework with these minimum features: add, edit, delete task, mark tasks as completed, save data to a DB
What to use and why:
    Python with flask framework - flask is a lightweight, minimalistic framework, well-suited for creating simple applications. The product runs fast, is easy to host and run on local network.
    posgreSQL database - open source and popular db system
- Implementation:
    Setup environment: aim for a portable application that's easy to set up and run
    Simple CRUD implementation
    UI and polish
- Using github copilot with gpt-luna-6, the agent is fast and efficient with impressive self-valuations, it took its time working through problem and self-check on every step, as long as a there is a checklist setup it will follow it extremely closely. Although this self-valuations mechanism would sometime backfire and it trap itself in an endless corner of editing code and fixing bug with the wrong approach, so it's important to prompt in detail OR use a detailed checklist.
- I do not let the agent edit checklist.md as it's the backbone of the operation, each step is verified and marked down by me, I also don't let agent run bash code for security reasons
- With more time I would expand the application to work as a team's tool, with shared goal and email reminder

    