import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "http://localhost:8085/api/tasks";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ id: "", title: "", description: "", time: "", completed: false });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toISOString().slice(0, 16);
      tasks.forEach(task => {
        if (!task.completed && task.time === now) {
          alert(`Time to start: ${task.title}`);
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      console.log("Fetched tasks:", response.data); // Debugging
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "time" ? value : value,  // Directly store datetime-local value
    }));
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await axios.put(`${API_URL}/${formData.id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      setFormData({ id: "", title: "", description: "", time: "", completed: false });
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleEdit = (task) => {
    setFormData(task);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      console.log("Toggling task ID:", id);
  
      const taskToUpdate = tasks.find(task => task.id === id);
      console.log("Task to update:", taskToUpdate);
  
      if (!taskToUpdate) {
        console.error("Task not found!");
        return;
      }
  
      // Ensure all fields are included
      const updatedTask = { 
        ...taskToUpdate, 
        completed: !completed, 
        time: taskToUpdate.time || "" // Ensure time is not lost
      };
      console.log("Updated Task:", updatedTask);
  
      await axios.put(`${API_URL}/${id}`, updatedTask); // Send complete task object
      fetchTasks(); // Refresh task list
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };
  
  
  
  

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Task Manager</h2>
      <form onSubmit={handleSubmit} className="mb-4 p-4 bg-light shadow rounded">
        <div className="mb-3">
          <input
            type="text"
            name="title"
            placeholder="Task Title"
            value={formData.title}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <textarea
            name="description"
            placeholder="Task Description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="datetime-local"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {formData.id ? "Update" : "Add"} Task
        </button>
      </form>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td><td>{new Date(task.time).toLocaleString()}</td>
              </td>


              <td>{task.completed ? "Completed" : "Not Completed"}</td>
              <td>
                <button onClick={() => handleEdit(task)} className="btn btn-warning me-2">
                  Edit
                </button>
                <button onClick={() => handleDelete(task.id)} className="btn btn-danger me-2">
                  Delete
                </button>
                <button onClick={() => toggleComplete(task.id, task.completed)} className={`btn ${task.completed ? "btn-success" : "btn-secondary"}`}>
                  {task.completed ? "Mark Incomplete" : "Mark Complete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskManager;
