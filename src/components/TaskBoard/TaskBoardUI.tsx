import React from 'react';
import { TaskBoardLogicProps } from './TaskBoardLogic';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';

const TaskBoardUI: React.FC<TaskBoardLogicProps> = ({
  tasks,
  tasksByStatus,
  columnsOrder,
  getContactNameById,
  getContactInitialsById,
  getSubtaskCompletion,
  getPriorityColor,
  getPriorityIcon,
  openEditModal,
  handleDeleteTask,
  onDragEnd,
}) => {
  return (
    <main
      className="p-6 min-h-screen"
      role="main"
      aria-labelledby="task-board-heading"
    >
      <h1
        id="task-board-heading"
        className="text-3xl md:text-4xl mb-6 text-center font-bold"
      >
        Task Board
      </h1>
      {tasks.length === 0 ? (
        <p className="text-gray-700 text-center text-lg" role="status">
          Your tasks will appear here.
        </p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <section
            className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0"
            aria-label="Task Columns"
          >
            {columnsOrder.map((columnId) => (
              <Droppable droppableId={columnId} key={columnId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 bg-gray-100 p-4 rounded-md shadow-md ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                    aria-labelledby={`column-${columnId}-heading`}
                  >
                    <h2
                      id={`column-${columnId}-heading`}
                      className="text-xl font-semibold mb-4 text-center"
                    >
                      {columnId}
                    </h2>
                    <ul role="list">
                      {tasksByStatus[columnId].map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex flex-col justify-between bg-white p-4 rounded-lg shadow mb-4 ${
                                snapshot.isDragging ? 'bg-blue-100' : 'bg-white'
                              } transition-colors duration-200`}
                              aria-labelledby={`task-title-${task.id}`}
                              aria-describedby={`task-description-${task.id}`}
                            >
                              <div>
                                <h3
                                  id={`task-title-${task.id}`}
                                  className="text-lg font-semibold mb-2"
                                >
                                  {task.title}
                                </h3>
                                <p
                                  id={`task-description-${task.id}`}
                                  className="text-gray-700 mb-2 hidden sm:block"
                                >
                                  {task.description.length > 50
                                    ? task.description.slice(0, 47) + '...'
                                    : task.description}
                                </p>
                                <div className="sm:flex items-center mb-2 hidden">
                                  {task.assignedTo.map((id:string) => (
                                    <div
                                      key={id}
                                      className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2 text-xs"
                                      title={getContactNameById(id)}
                                      aria-label={`Assigned to ${getContactNameById(id)}`}
                                    >
                                      {getContactInitialsById(id)}
                                    </div>
                                  ))}
                                </div>
                                {task.subtask && task.subtask.length > 0 && (
                                  <p className="text-gray-600 mb-2">
                                    <strong>Subtasks:</strong>{' '}
                                    {getSubtaskCompletion(task)}
                                  </p>
                                )}
                              </div>
                              <div className="flex justify-between items-center sm:mt-4">
                                <div className="flex items-center">
                                  <span
                                    className={`${getPriorityColor(task.priority)} mr-2`}
                                    style={{ fontSize: '1.5rem' }}
                                  >
                                    {getPriorityIcon(task.priority)}
                                  </span>
                                  <span className="text-black font-medium">
                                    {task.priority}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => openEditModal(task)}
                                    className="text-blue-500 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                    aria-label={`Edit task ${task.title}`}
                                  >
                                    <FaEdit size={30} aria-hidden="true" className='md:scale-125'/>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-red-700 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                                    aria-label={`Delete task ${task.title}`}
                                  >
                                    <FaTrashAlt size={25} aria-hidden="true" className='md:scale-125'/>
                                  </button>
                                </div>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  </div>
                )}
              </Droppable>
            ))}
          </section>
        </DragDropContext>
      )}
    </main>
  );
};

export default TaskBoardUI;
