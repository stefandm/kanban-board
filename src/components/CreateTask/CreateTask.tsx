import React from 'react';
import CreateTaskLogic, { CreateTaskLogicData } from './CreateTaskLogic';
import CreateTaskUI from './CreateTaskUI';

interface CreateTaskProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTask: React.FC<CreateTaskProps> = ({ isOpen, onClose }) => {
  return (
    <CreateTaskLogic onClose={onClose} isOpen={isOpen}>
      {(logicData: CreateTaskLogicData) => (
        <CreateTaskUI {...logicData} isOpen={isOpen} onClose={onClose} />
      )}
    </CreateTaskLogic>
  );
};

export default CreateTask;
