import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SkillDetail, itemTypeMapping, Skill } from './types';
import ClaudePrompt from './ClaudePrompt';
import OpenAIPrompt from './OpenAIPrompt';
import SQLTable from '@/components/SQLTable';
import { useToast } from '@/hooks/use-toast';
import { CreateParameter } from './CreateParameter';

export interface SkillDetailTableProps {
  skill: Skill;
}

const SkillDetailTable: React.FC<SkillDetailTableProps> = ({ skill }) => {
  const [parameters, setParameters] = useState<SkillDetail[]>([]);
  const [increment, setIncrementToRefetch] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/get_parameters_for_skills/${skill.skill_id}`)
      .then((response) => {
        const updatedParameters = response.data.map(
          (parameter: SkillDetail) => ({
            ...parameter,
            item_type: itemTypeMapping[parameter.item_type as number], // Explicitly cast to number
            value_type: itemTypeMapping[parameter.value_type as number], // Explicitly cast to number
          })
        );
        setParameters(updatedParameters);
      })
      .catch((error) => console.error('Error fetching skill details:', error));
  }, [skill.skill_id, increment]);

  const handleItemTypeChange = (parameterId: string, newItemType: string) => {
    const itemTypeKey = parseInt(
      Object.keys(itemTypeMapping).find(
        (key: string) => itemTypeMapping[parseInt(key)] === newItemType
      ) || '0'
    );
    axios
      .put(
        `http://127.0.0.1:8000/edit_parameter_item_type/${parameterId}/${itemTypeKey}`
      )
      .then(() => {
        toast({
          title: 'Success',
          description: 'Item type updated successfully',
        });
        setParameters((prevParameters) =>
          prevParameters.map((parameter) =>
            parameter.parameter_id === parameterId
              ? { ...parameter, item_type: newItemType }
              : parameter
          )
        );
      })
      .catch((error) => {
        console.error('Error updating item type:', error);
        toast({ title: 'Error', description: 'Failed to update item type' });
      });
  };

  return (
    <>
      <Tabs defaultValue="raw-sql" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="raw-sql">Raw SQL</TabsTrigger>
          <TabsTrigger value="gemini">Gemini</TabsTrigger>
          <TabsTrigger value="openai">OpenAI</TabsTrigger>
          <TabsTrigger value="claude">Claude</TabsTrigger>
        </TabsList>
        <TabsContent value="raw-sql">
          <SQLTable data={parameters} onItemTypeChange={handleItemTypeChange} />
        </TabsContent>
        <TabsContent value="gemini">{/* Empty content for now */}</TabsContent>
        <TabsContent value="openai">
          <OpenAIPrompt skill={skill} parameters={parameters} />
        </TabsContent>
        <TabsContent value="claude">
          <ClaudePrompt skill={skill} parameters={parameters} />
        </TabsContent>
      </Tabs>
      <CreateParameter
        skill={skill}
        setIncrementToRefetch={setIncrementToRefetch}
      />
    </>
  );
};

export default SkillDetailTable;
