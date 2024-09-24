import { z } from 'zod';

export const itemTypeMapping: { [key: number]: string } = {
  1: 'string',
  2: 'number',
  3: 'integer',
  4: 'object',
  5: 'array',
  6: 'boolean',
  7: 'null',
};

export interface Skill {
  skill_id: number;
  version_id: number;
  name: string;
  enabled_by_default: number;
  input_use_schema: number;
  endpoint: string;
  prompt: string;
}

export interface SkillDetail {
  parameter_id?: string | undefined;
  skill_version_id?: number;
  name: string;
  description: string;
  value_type: number | string;
  item_type: number | string;
  value_enum?: string | undefined;
  is_required: number;
  status: number | undefined;
  create_by: string | undefined;
}

export const formSchemaSkillDetail = z.object({
  parameter_id: z.string().optional(),
  skill_version_id: z.number(),
  name: z.string().min(1, {
    message: 'Name is required',
  }),
  description: z.string().min(4, {
    message: 'Description is required',
  }),
  value_type: z
    .union([z.number(), z.string()])
    .refine((val) => val !== undefined, {
      message: 'Value type is required',
    }),
  item_type: z
    .union([z.number(), z.string()])
    .refine((val) => val !== undefined, {
      message: 'Item type is required',
    }),
  value_enum: z.string().optional(),
  is_required: z.number().int().min(0, {
    message: 'is_required must be selected',
  }),
  status: z.number().min(0, {
    message: 'Status is required',
  }),
  create_by: z.string().email({
    message: 'Please write a valid email',
  }),
});
