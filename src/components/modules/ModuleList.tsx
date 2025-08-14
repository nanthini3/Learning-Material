// src/components/modules/ModuleList.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, BookOpen, Target, MoreVertical, Eye, Archive, FileText } from "lucide-react";
import { toast } from "sonner";

interface Module {
  id: string;
  _id?: string; // MongoDB ID field
  title: string;
  description: string;
  learningObjectives: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface ModuleListProps {
  modules: Module[];
  onEdit: (moduleId: string) => void;
  onDelete: (moduleId: string) => void;
  onStatusChange: (moduleId: string, status: 'draft' | 'published' | 'archived') => void;
}

export function ModuleList({ modules, onEdit, onDelete, onStatusChange }: ModuleListProps) {
  const handleEdit = (module: Module) => {
    const moduleId = module.id || module._id;
    console.log('Edit clicked for module:', module.title, 'ID:', moduleId);
    
    if (!moduleId) {
      console.error('No module ID found for module:', module);
      toast.error('Unable to edit module - ID missing');
      return;
    }
    
    onEdit(moduleId);
  };

  const handleDelete = async (module: Module) => {
    const moduleId = module.id || module._id;
    
    if (!moduleId) {
      console.error('No module ID found for module:', module);
      toast.error('Unable to delete module - ID missing');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${module.title}"? This action cannot be undone.`)) {
      try {
        await onDelete(moduleId);
      } catch (error) {
        console.error('Error deleting module:', error);
        toast.error('Failed to delete module');
      }
    }
  };

  const handleStatusChange = async (module: Module, newStatus: 'draft' | 'published' | 'archived') => {
    const moduleId = module.id || module._id;
    
    if (!moduleId) {
      console.error('No module ID found for module:', module);
      toast.error('Unable to update module status - ID missing');
      return;
    }

    try {
      await onStatusChange(moduleId, newStatus);
      toast.success(`Module ${newStatus === 'published' ? 'published' : newStatus === 'archived' ? 'archived' : 'saved as draft'} successfully`);
    } catch (error) {
      console.error('Error updating module status:', error);
      toast.error('Failed to update module status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Archived</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <BookOpen className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h3>
        <p className="text-gray-600 mb-4 max-w-sm">
          Get started by creating your first learning module. Add content, objectives, and help your team learn!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => {
        const moduleId = module.id || module._id || `module-${Math.random()}`;
        
        return (
          <Card key={moduleId} className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg leading-tight line-clamp-2 flex-1">
                        {module.title}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="ml-2">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(module, 'draft')}>
                            <FileText className="mr-2 h-4 w-4" />
                            Save as Draft
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(module, 'published')}>
                            <Eye className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(module, 'archived')}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500">
                        Created {formatDate(module.createdAt)}
                      </p>
                      {getStatusBadge(module.status)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {module.description}
                </p>
              </div>

              {/* Learning Objectives */}
              <div className="mb-6 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Learning Objectives ({module.learningObjectives.length})
                  </span>
                </div>
                <ul className="space-y-1">
                  {module.learningObjectives.slice(0, 3).map((objective, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-green-500 font-bold leading-none">•</span>
                      <span className="line-clamp-2">{objective}</span>
                    </li>
                  ))}
                  {module.learningObjectives.length > 3 && (
                    <li className="text-xs text-gray-400 pl-3">
                      +{module.learningObjectives.length - 3} more objectives
                    </li>
                  )}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(module)}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(module)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}