'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from './ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { itemTypeMapping, Skill, SkillDetail } from './types';
import { useForm } from 'react-hook-form';
import { Form } from './ui/form';
import { z } from 'zod';
import { formSchemaSkillDetail } from './types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClaudePrompt from './ClaudePrompt';
import OpenAIPrompt from './OpenAIPrompt';
import { useToast } from '@/hooks/use-toast';
import { useWatch } from 'react-hook-form';
import axios from 'axios';
import { ReloadIcon } from '@radix-ui/react-icons';

export const CreateParameter: React.FC<{
  skill: Skill;
  setIncrementToRefetch: (val: number) => void;
}> = ({ skill, setIncrementToRefetch }) => {
  const id = React.useId();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const { toast } = useToast();
  const [parameters, setParameters] = React.useState<SkillDetail[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchemaSkillDetail>>({
    resolver: zodResolver(formSchemaSkillDetail),
    defaultValues: {
      skill_version_id: skill.version_id,
    },
  });

  const watchedFields = useWatch({
    control: form.control,
    name: [
      'create_by',
      'description',
      'is_required',
      'item_type',
      'name',
      'parameter_id',
      'status',
      'value_enum',
      'value_type',
    ],
  });

  React.useEffect(() => {
    const updated_values = form.getValues();
    setParameters([updated_values]);
  }, [watchedFields]);

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchemaSkillDetail>) {
    setLoading(true);
    axios
      .post('http://127.0.0.1:8000/create_parameter', values)
      .then(() => {
        toast({
          title: 'Success',
          description: 'Parameter has been added successfully!',
        });
        setIsDialogOpen(false); // Close the dialog
        setIncrementToRefetch(Math.floor(Math.random() * 100) + 1);
      })
      .catch(() => {
        toast({ title: 'Error', description: 'Failed to add a parameter' });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full my-2" variant="outline">
          Add a new parameter
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[1025px] h-[90vh] flex content-between pt-10">
        <ScrollArea className="w-2/4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 px-3"
            >
              <DialogHeader>
                <DialogTitle>Add a parameter</DialogTitle>
                <DialogDescription>
                  Fill out the form below to add a new parameter.
                </DialogDescription>
              </DialogHeader>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='How to sort the videos, should be "asc" or "desc"'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="value_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value Type</FormLabel>
                        <FormControl>
                          <Select
                            defaultValue=""
                            name="value_type"
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                          >
                            <SelectTrigger
                              id={`area-${id}`}
                              aria-label="Area"
                              ref={field.ref}
                            >
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {/* Put keys as value and the content as the value of the dictionary */}
                                {Object.entries(itemTypeMapping).map(
                                  ([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                      {value}
                                    </SelectItem>
                                  )
                                )}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="item_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Type</FormLabel>
                        <FormControl>
                          <Select
                            defaultValue=""
                            name="item_type"
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            disabled={form.getValues().value_type !== 5}
                          >
                            <SelectTrigger
                              id={`area-${id}`}
                              aria-label="Area"
                              ref={field.ref}
                            >
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {/* Put keys as value and the content as the value of the dictionary */}
                                {Object.entries(itemTypeMapping).map(
                                  ([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                      {value}
                                    </SelectItem>
                                  )
                                )}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="value_enum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value enum</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g: film,drama,any. asc,desc"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_required"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Is this parameter required?</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue=""
                        name="is_required"
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger aria-label="Area">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem key={1} value={'1'}>
                            Yes
                          </SelectItem>
                          <SelectItem key={0} value={'0'}>
                            No
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={`status`}>Status</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue=""
                        name="status"
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger id={`status`} aria-label="Area">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem key={1} value={'1'}>
                            On
                          </SelectItem>
                          <SelectItem key={0} value={'0'}>
                            Off
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="create_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={`create_by`}>
                      Created By (email)
                    </FormLabel>
                    <FormControl>
                      <Input
                        id={`create_by`}
                        placeholder="aaa@bbb.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="justify-between space-x-2">
                <Button disabled={loading} className="w-full" type="submit">
                  {loading && (
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
        <Tabs defaultValue="claude" className="w-2/4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gemini">Gemini</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="claude">Claude</TabsTrigger>
          </TabsList>
          <TabsContent value="gemini"></TabsContent>
          <TabsContent value="openai">
            <OpenAIPrompt skill={skill} parameters={parameters} />
          </TabsContent>
          <TabsContent value="claude">
            <ClaudePrompt skill={skill} parameters={parameters} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
