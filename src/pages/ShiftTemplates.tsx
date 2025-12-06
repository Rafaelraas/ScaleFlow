"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ShiftTemplateForm from "@/components/ShiftTemplateForm";
import { useSession } from "@/providers/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client.ts";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ShiftTemplate {
  id: string;
  name: string;
  duration_hours: number;
  default_start_time: string;
  default_role_id: string | null;
  roles: { name: string } | null;
  default_notes: string | null;
}

const ITEMS_PER_PAGE = 10;

const ShiftTemplates = () => {
  const { userProfile, userRole, isLoading } = useSession();
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchShiftTemplates = useCallback(async () => {
    if (!userProfile?.company_id || userRole !== 'manager') {
      setLoadingTemplates(false);
      return;
    }

    setLoadingTemplates(true);

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // Execute count and data queries in parallel
    const [countResult, dataResult] = await Promise.all([
      supabase
        .from('shift_templates')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id),
      supabase
        .from('shift_templates')
        .select('*, roles(name)')
        .eq('company_id', userProfile.company_id)
        .order('name', { ascending: true })
        .range(from, to)
    ]);

    if (countResult.error) {
      showError("Failed to fetch template count: " + countResult.error.message);
    } else {
      setTotalCount(countResult.count || 0);
    }

    if (dataResult.error) {
      showError("Failed to fetch shift templates: " + dataResult.error.message);
      setTemplates([]);
    } else {
      const formattedTemplates = (dataResult.data || []).map(template => ({
        ...template,
        roles: template.roles?.[0] || null,
      }));
      setTemplates(formattedTemplates as ShiftTemplate[] || []);
    }
    setLoadingTemplates(false);
  }, [userProfile?.company_id, userRole, currentPage]);

  useEffect(() => {
    if (!isLoading) {
      fetchShiftTemplates();
    }
  }, [isLoading, fetchShiftTemplates]);

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingTemplate(null);
    setCurrentPage(1); // Reset to first page
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
        <div className="rounded-md border">
          <Table>
            <TableCaption>Loading shift templates...</TableCaption>
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
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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

      {/* Pagination */}
      {!loadingTemplates && totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Show first page, last page, and pages around current page
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  (page === 2 && currentPage > 3) ||
                  (page === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return <PaginationEllipsis key={`ellipsis-${page}`} />;
                }
                return null;
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} templates
          </p>
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
    </div>
  );
};

export default ShiftTemplates;