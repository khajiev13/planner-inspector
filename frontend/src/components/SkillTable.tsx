import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from './ui/input';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import SkillDetailTable from './SkillParametersTable';
import { Skill } from './types';

const EditableTableCell: React.FC<{
  entry: { skill_id: number; prompt: string };
}> = ({ entry }) => {
  const { toast } = useToast(); // Initialize the toast hook
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(entry.prompt);
  const [uiPrompt, setUiPrompt] = useState(entry.prompt);

  const updateSkillPrompt = async (newPrompt: string) => {
    const processingToast = toast({
      description: 'Updating prompt...',
    });
    console.log('Updating prompt:', newPrompt);
    try {
      await axios.put(
        `http://127.0.0.1:8000/edit_skill_prompt/${entry.skill_id}/${newPrompt}`
      );
      processingToast.dismiss(); // Dismiss the processing toast
      toast({
        description: 'Prompt updated successfully',
      });
      setUiPrompt(newPrompt);
    } catch (error) {
      console.error('Error updating prompt:', error);
      processingToast.dismiss(); // Dismiss the processing toast
      toast({
        description: 'Failed to update prompt',
        variant: 'destructive',
      });
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPrompt(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (editedPrompt !== uiPrompt) {
        updateSkillPrompt(editedPrompt);
      }
    }
  };

  return (
    <TableCell onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        <Input
          type="text"
          value={editedPrompt}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setIsEditing(false)}
          autoFocus
        />
      ) : (
        uiPrompt
      )}
    </TableCell>
  );
};

const SkillsTable: React.FC = () => {
  const [data, setData] = useState<Skill[]>([]);

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/get_all_recent_skills')
      .then((response) => setData(response.data))
      .catch((error) => console.error('Error fetching skills:', error));
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Skill ID</TableHead>
          <TableHead>Version ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Enabled By Default</TableHead>
          <TableHead>Input Use Schema</TableHead>
          <TableHead>Endpoint</TableHead>
          <TableHead>Prompt</TableHead>
          <TableHead>Parameters</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((entry) => (
          <TableRow key={entry.skill_id}>
            <TableCell className="font-medium">{entry.skill_id}</TableCell>
            <TableCell>{entry.version_id}</TableCell>
            <TableCell>{entry.name}</TableCell>
            <TableCell>{entry.enabled_by_default}</TableCell>
            <TableCell>{entry.input_use_schema}</TableCell>
            <TableCell>{entry.endpoint}</TableCell>
            <EditableTableCell entry={entry} />
            <TableCell>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Parameters</Button>
                </PopoverTrigger>
                <PopoverContent className="w-[900px]">
                  <SkillDetailTable skill={entry} />
                </PopoverContent>
              </Popover>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SkillsTable;
