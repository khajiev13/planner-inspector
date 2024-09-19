import React from 'react';
import UserSkillTable from './components/SkillTable';
import { Toaster } from '@/components/ui/toaster';

const App: React.FC = () => {
  return (
    <div>
      <UserSkillTable />
      <Toaster />
    </div>
  );
};

export default App;
