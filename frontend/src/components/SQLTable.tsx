import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { itemTypeMapping, SkillDetail } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';

const SQLTable: React.FC<{
  data: SkillDetail[];
  onItemTypeChange: (parameterId: string, newItemType: string) => void;
}> = ({ data, onItemTypeChange }) => {
  return (
    <ScrollArea className="h-96">
      <Table>
        <TableCaption>Parameter Details</TableCaption>
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
              <EditableTableCell
                parameterId={parameter.parameter_id ?? ''}
                initialDescription={parameter.description}
              />
              <TableCell>{parameter.value_type}</TableCell>
              <TableCell>
                <Select
                  value={parameter.item_type as string}
                  onValueChange={(value) =>
                    onItemTypeChange(parameter.parameter_id ?? '', value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={parameter.item_type} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Item Types</SelectLabel>
                      {Object.values(itemTypeMapping).map((itemType) => (
                        <SelectItem key={itemType} value={itemType}>
                          {itemType}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{parameter.is_required}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const EditableTableCell: React.FC<{
  parameterId: string;
  initialDescription: string;
}> = ({ parameterId, initialDescription }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] =
    useState(initialDescription);
  const [uiDescription, setUiDescription] = useState(initialDescription);

  const updateParameterDescription = async (newDescription: string) => {
    const processingToast = toast({
      description: 'Updating description...',
    });
    try {
      await axios.put(
        `http://127.0.0.1:8000/edit_parameter_description/${parameterId}/${newDescription}`
      );
      processingToast.dismiss();
      toast({
        description: 'Description updated successfully',
      });
      setUiDescription(newDescription);
    } catch (error) {
      console.error('Error updating description:', error);
      processingToast.dismiss();
      toast({
        description: 'Failed to update description',
        variant: 'destructive',
      });
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedDescription(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (editedDescription !== uiDescription) {
        updateParameterDescription(editedDescription);
      }
    }
  };

  return (
    <TableCell onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        <Input
          type="text"
          value={editedDescription}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setIsEditing(false)}
          autoFocus
        />
      ) : (
        uiDescription
      )}
    </TableCell>
  );
};
export default SQLTable;
