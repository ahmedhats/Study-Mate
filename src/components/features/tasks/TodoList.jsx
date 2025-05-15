import React, { useState } from "react";
import {
  Row,
  Col,
  Empty,
  Select,
  Radio,
  Input,
  Space,
  Button,
  Spin,
} from "antd";
import { PlusOutlined, FilterOutlined } from "@ant-design/icons";
import Todo from "./Todo";
import "./TodoList.css";

const { Option } = Select;
const { Search } = Input;

/**
 * TodoList component for displaying and managing multiple todos
 */
const TodoList = ({
  todos = [],
  loading = false,
  onToggleCompletion,
  onDeleteTodo,
  onEditTodo,
  onUpdateSubtask,
  onAddNewTodo,
  currentUser,
}) => {
  // Filtering state
  const [importanceFilter, setImportanceFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [showFilters, setShowFilters] = useState(false);

  // Reset all filters
  const resetFilters = () => {
    setImportanceFilter(null);
    setPriorityFilter(null);
    setStatusFilter(null);
    setSearchText("");
    setSortBy("dueDate");
  };

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Filter and sort todos
  const getFilteredTodos = () => {
    if (!Array.isArray(todos)) return [];

    return todos
      .filter((todo) => {
        // Filter by search text
        if (
          searchText &&
          !todo.title.toLowerCase().includes(searchText.toLowerCase()) &&
          !todo.description?.toLowerCase().includes(searchText.toLowerCase())
        ) {
          return false;
        }

        // Filter by importance
        if (importanceFilter && todo.importance !== importanceFilter) {
          return false;
        }

        // Filter by priority
        if (priorityFilter && todo.priority !== priorityFilter) {
          return false;
        }

        // Filter by status
        if (statusFilter && todo.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by selected property
        switch (sortBy) {
          case "title":
            return a.title.localeCompare(b.title);

          case "dueDate":
            // Sort by due date (null dates at the end)
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);

          case "priority":
            // Sort by priority (urgent > high > medium > low)
            const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 };
            return (
              (priorityOrder[a.priority] || 999) -
              (priorityOrder[b.priority] || 999)
            );

          case "importance":
            // Sort by importance (critical > important > normal > optional)
            const importanceOrder = {
              critical: 1,
              important: 2,
              normal: 3,
              optional: 4,
            };
            return (
              (importanceOrder[a.importance] || 999) -
              (importanceOrder[b.importance] || 999)
            );

          case "status":
            // Sort by status (todo > in_progress > completed)
            const statusOrder = {
              todo: 1,
              in_progress: 2,
              completed: 3,
              archived: 4,
            };
            return (
              (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999)
            );

          case "progress":
            // Sort by progress
            const progressA = a.progress || 0;
            const progressB = b.progress || 0;
            return progressB - progressA; // Higher progress first

          default:
            return 0;
        }
      });
  };

  // Get filtered and sorted todos
  const filteredTodos = getFilteredTodos();

  return (
    <div className="todo-list-container">
      <div className="todo-list-header">
        <div className="todo-list-title">
          <h2>Todo List</h2>
          <span className="todo-count">
            {todos.length} task{todos.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="todo-list-actions">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onAddNewTodo}
            >
              New Task
            </Button>
            <Button
              type="default"
              icon={<FilterOutlined />}
              onClick={toggleFilters}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </Space>
        </div>
      </div>

      {showFilters && (
        <div className="todo-list-filters">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Search
                placeholder="Search tasks"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Priority"
                style={{ width: "100%" }}
                value={priorityFilter}
                onChange={setPriorityFilter}
                allowClear
              >
                <Option value="urgent">Urgent</Option>
                <Option value="high">High</Option>
                <Option value="medium">Medium</Option>
                <Option value="low">Low</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Importance"
                style={{ width: "100%" }}
                value={importanceFilter}
                onChange={setImportanceFilter}
                allowClear
              >
                <Option value="critical">Critical</Option>
                <Option value="important">Important</Option>
                <Option value="normal">Normal</Option>
                <Option value="optional">Optional</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Status"
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
              >
                <Option value="todo">To Do</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="completed">Completed</Option>
              </Select>
            </Col>
            <Col xs={24} md={12}>
              <Space size="middle">
                <span>Sort by:</span>
                <Radio.Group
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <Radio.Button value="dueDate">Due Date</Radio.Button>
                  <Radio.Button value="priority">Priority</Radio.Button>
                  <Radio.Button value="status">Status</Radio.Button>
                  <Radio.Button value="progress">Progress</Radio.Button>
                </Radio.Group>
              </Space>
            </Col>
            <Col xs={24} md={12} className="filter-buttons">
              <Button onClick={resetFilters}>Reset Filters</Button>
            </Col>
          </Row>
        </div>
      )}

      <div className="todo-list-content">
        {loading ? (
          <div className="todo-list-loading">
            <Spin size="large" />
            <p>Loading tasks...</p>
          </div>
        ) : filteredTodos.length > 0 ? (
          filteredTodos.map((todo) => (
            <Todo
              key={todo._id}
              todo={todo}
              onToggleCompletion={onToggleCompletion}
              onDelete={onDeleteTodo}
              onEdit={onEditTodo}
              onUpdateSubtask={onUpdateSubtask}
              currentUser={currentUser}
            />
          ))
        ) : (
          <Empty
            description={
              <span>
                {searchText ||
                importanceFilter ||
                priorityFilter ||
                statusFilter
                  ? "No tasks match your filters"
                  : "No tasks yet"}
              </span>
            }
          >
            <Button type="primary" onClick={onAddNewTodo}>
              Create Task
            </Button>
          </Empty>
        )}
      </div>
    </div>
  );
};

export default TodoList;
