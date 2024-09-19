import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skill } from './SkillTable';

interface SkillDetail {
  parameter_id: string;
  name: string;
  description: string;
  value_type: number | string;
  value_enum: string | null;
  is_required: number;
  item_type: number | string;
}
// Mapping of item types
const itemTypeMapping: { [key: number]: string } = {
  1: 'string',
  2: 'number',
  3: 'integer',
  4: 'object',
  5: 'array',
  6: 'boolean',
  7: 'null',
};

interface SkillDetailTableProps {
  skill: Skill;
}

const SkillDetailTable: React.FC<SkillDetailTableProps> = ({ skill }) => {
  const [parameters, setParameters] = useState<SkillDetail[]>([]);

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
  }, [skill.skill_id]);

  return (
    <Tabs defaultValue="raw-sql" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="raw-sql">Raw SQL</TabsTrigger>
        <TabsTrigger value="gemini">Gemini</TabsTrigger>
        <TabsTrigger value="openai">OpenAI</TabsTrigger>
        <TabsTrigger value="claude">Claude</TabsTrigger>
      </TabsList>
      <TabsContent value="raw-sql">
        <SQLTable data={parameters} />
      </TabsContent>
      <TabsContent value="gemini">{/* Empty content for now */}</TabsContent>
      <TabsContent value="openai">
        <OpenAIPrompt skill={skill} parameters={parameters} />
      </TabsContent>
      <TabsContent value="claude">
        <ClaudePrompt skill={skill} parameters={parameters} />
      </TabsContent>
    </Tabs>
  );
};

const SQLTable: React.FC<{ data: SkillDetail[] }> = ({ data }) => {
  return (
    <Table>
      <TableCaption>Skill Details</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Parameter ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Value Type</TableHead>
          <TableHead>Item Type</TableHead>
          <TableHead>Is Required</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((parameter) => (
          <TableRow key={parameter.parameter_id}>
            <TableCell>{parameter.parameter_id}</TableCell>
            <TableCell>{parameter.name}</TableCell>
            <TableCell>{parameter.description}</TableCell>
            <TableCell>{parameter.value_type}</TableCell>
            <TableCell>{parameter.item_type}</TableCell>
            <TableCell>{parameter.is_required}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const OpenAIPrompt: React.FC<{
  skill: SkillDetailTableProps['skill'];
  parameters: SkillDetail[];
}> = ({ skill, parameters }) => {
  const transformToOpenAIFormat = (
    skill: SkillDetailTableProps['skill'],
    parameters: SkillDetail[]
  ) => {
    const properties: { [key: string]: any } = {};
    const required: string[] = [];

    parameters.forEach((parameter) => {
      properties[parameter.name] = {
        type: parameter.value_type,
        description: parameter.description,
        ...(parameter.value_type === 'array' && {
          items: {
            type: parameter.item_type,
          },
        }),
      };
    });

    // If is_required is 1, add the name to required array
    parameters.forEach((parameter) => {
      if (parameter.is_required === 1) {
        required.push(parameter.name);
      }
    });

    return {
      type: 'function',
      function: {
        name: skill.name.replace(/\s+/g, '_'),
        description: skill.prompt,
        parameters: {
          type: 'object',
          properties,
          required,
        },
      },
    };
  };

  const transformedData = transformToOpenAIFormat(skill, parameters);

  return (
    <>
      <ScrollArea className="h-96 rounded-md border p-4">
        <pre>{JSON.stringify(transformedData, null, 2)}</pre>
      </ScrollArea>
    </>
  );
};

const ClaudePrompt: React.FC<{
  skill: SkillDetailTableProps['skill'];
  parameters: SkillDetail[];
}> = ({ skill, parameters }) => {
  const transformToOpenAIFormat = (
    skill: SkillDetailTableProps['skill'],
    parameters: SkillDetail[]
  ) => {
    const properties: { [key: string]: any } = {};
    const required: string[] = [];

    parameters.forEach((parameter) => {
      properties[parameter.name] = {
        type: parameter.value_type,
        description: parameter.description,
        ...(parameter.value_type === 'array' && {
          items: {
            type: parameter.item_type,
          },
        }),
      };
    });

    // If is_required is 1, add the name to required array
    parameters.forEach((parameter) => {
      if (parameter.is_required === 1) {
        required.push(parameter.name);
      }
    });

    return {
      name: skill.name.replace(/\s+/g, '_'),
      description: skill.prompt,
      input_schema: {
        type: 'object',
        properties,
        required,
      },
    };
  };

  const transformedData = transformToOpenAIFormat(skill, parameters);

  return (
    <ScrollArea className="h-96 rounded-md border p-4">
      <pre>{JSON.stringify(transformedData, null, 2)}</pre>
    </ScrollArea>
  );
};
export default SkillDetailTable;
