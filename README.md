# To-Do App

A simple application for creating a to-do list using JavaScript, HTML, and Bootstrap.

## Description

This application allows users to:
- Create tasks.
- Mark tasks as completed.
- Delete tasks.
- Work with tasks stored both on a backend server (API) and in `localStorage` (offline mode).
- Automatically synchronize tasks between API and localStorage.

## Project Structure

- **index.html**: The main page of the application.
- **js/view.js**: Module responsible for rendering the UI and handling user interactions.
- **js/api.js**: Module for working with the backend API and localStorage (hybrid logic).
- **js/todo-app.js**: (Optional) Combined logic for demonstration or legacy purposes.
- **README.md**: Project documentation.

## Technologies Used

- **HTML**: For the structure of the page.
- **CSS (Bootstrap)**: For styling the interface.
- **JavaScript (ES6 modules)**: For implementing functionality and modularity.
- **localStorage**: For saving data on the client side (offline support).
- **REST API**: For persistent storage and multi-user support.

## How to Run the Project

1. Clone the repository:
   ```bash
   git clone https://github.com/kate8382/to-do_app
   ```
2. Start the server (if required):
   ```powershell
   cd to-do_app/todo-server
   node index.js
   ```
3. Open the `index.html` file in your browser.

## Features

1. **Adding tasks:**
   - Enter the task name in the input field.
   - Click the "Add Task" button.

2. **Marking tasks as completed:**
   - Click the "Done" button next to a task to mark it as completed or uncompleted.

3. **Deleting tasks:**
   - Click the "Delete" button next to a task to remove it.

4. **Saving and synchronizing data:**
   - All tasks are saved both in localStorage and on the server (API).
   - If the server is unavailable, the app works in offline mode using localStorage.
   - When the server becomes available again, data is synchronized automatically.

## Navigation

The application supports multiple to-do lists:

* **My Tasks**
* **Mom's Tasks**
* **Dad's Tasks**

You can switch between lists using the navigation menu. Each list is stored and synchronized separately.

## Screenshots

![Screenshot 1](screenshots/image1.png)
![Screenshot 2](screenshots/image2.png)
![Screenshot 3](screenshots/image3.png)

## License

This project is licensed under the [MIT License](LICENSE).
