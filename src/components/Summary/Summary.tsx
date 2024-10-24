import React from 'react';
import SummaryLogic from './SummaryLogic';
import SummaryUI from './SummaryUI';

const Summary: React.FC = () => {
  return (
    <SummaryLogic>
      {({ tasks, statusCounts, urgentTasks, loading, isAuthenticated }) => (
        <SummaryUI
          tasks={tasks}
          statusCounts={statusCounts}
          urgentTasks={urgentTasks}
          loading={loading}
          isAuthenticated={isAuthenticated}
        />
      )}
    </SummaryLogic>
  );
};

export default Summary;
