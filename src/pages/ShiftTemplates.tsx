"use client";

import React, { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ShiftTemplateForm from "@/components/ShiftTemplateForm";
import { useSession } from "@/providers/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ShiftTemplate {
  id: string;
  name: string;
  duration_hours: number;
  default_start_time: string;
  default_role_id: string | null;
  roles: { name: string } | null;
  default_notes: string | null;
}

const ShiftTemplates = () => {
  const { userProfile, userRole, isLoading } = useSession();
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);

  const fetchShiftTemplates = async () => {
    if (!userProfile?.company_id || userRole !== 'manager') {
      setLoadingTemplates(false);
      return;
    }

    setLoadingTemplates(true);
    const { data, error } = await supabase
      .from('shift_templates')
      .select('*, roles(name)')
      .eq('company_id', userProfile.company_id)
      .order('name', { ascending: true });

    if (error) {
      showError("Failed to fetch shift templates: " + error.message);
      setTemplates([]);
    } else {
      const formattedTemplates = (data || []).map(template => ({
        ...template,
        roles: template.roles?.[0] || null,
      }));
      setTemplates(formattedTemplates as ShiftTemplate[] || []);
    }
    setLoadingTemplates(false);
  };

  useEffect(() => {
    if (!isLoading) {
      fetchShiftTemplates();
    }
  }, [userProfile?.company_id, userRole, isLoading]);

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingTemplate(null);
    fetchShiftTemplates(); // Re-fetch templates after create/update
  };

  const handleEditClick = (template: ShiftTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    const { error } = await supabase
      .from('shift_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      showError("Failed to delete shift template: " + error.message);
    } else {
      showSuccess("Shift template deleted successfully!");
      fetchShiftTemplates(); // Re-fetch templates after deletion
    }
  };

  if (userRole !== 'manager') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            You do not have permission to view this page.
          </p>
        </div>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shift Templates</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>Create New Template</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Shift Template</DialogTitle>
            </DialogHeader>
            <ShiftTemplateForm onSuccess={handleFormSuccess} onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {loadingTemplates ? (
        <p>Loading shift templates...</p>
      ) : templates.length === 0 ? (
        <p className="text-center text-gray-500">No shift templates found for your company. Create one to get started!</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>A list of your company's shift templates.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Default Role</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{template.duration_hours} hours</TableCell>
                  <TableCell>{template.default_start_time}</TableCell>
                  <TableCell>{template.roles ? template.roles.name : 'Any'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{template.default_notes || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the "{template.name}" shift template.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTemplate(template.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editingTemplate && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Shift Template</DialogTitle>
            </DialogHeader>
            <ShiftTemplateForm
              initialData={editingTemplate}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
      <MadeWithDyad />
    </div>
  );
};

export default ShiftTemplates;