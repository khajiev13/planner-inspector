import { ScrollArea } from '@/components/ui/scroll-area';
import { SkillDetail } from './types';
import { SkillDetailTableProps } from './SkillParametersTable';
import { itemTypeMapping } from './types';

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
      if (typeof parameter.value_type === 'number') {
        parameter.value_type = itemTypeMapping[parameter.value_type];
      }
      if (typeof parameter.item_type === 'number') {
        parameter.item_type = itemTypeMapping[parameter.item_type];
      }
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

export default OpenAIPrompt;
