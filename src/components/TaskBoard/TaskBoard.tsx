import React from 'react';
import TaskBoardLogic, { TaskBoardLogicProps } from './TaskBoardLogic';
import TaskBoardUI from './TaskBoardUI';

const TaskBoard: React.FC = () => {
  return (
    <TaskBoardLogic>
      {(logicProps: TaskBoardLogicProps) => <TaskBoardUI {...logicProps} />}
    </TaskBoardLogic>
  );
};

export default TaskBoard;
