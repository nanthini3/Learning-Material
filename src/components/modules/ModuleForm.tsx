// src/components/modules/ModuleForm.tsx
'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, X, BookOpen, FileText, Eye } from "lucide-react";

interface ModuleFormData {
  title: string;
  description: string;
  learningObjectives: string[];
}

interface ModuleFormProps {
  initialData?: ModuleFormData;
  onSubmit: (data: ModuleFormData, action?: 'draft' | 'publish') => void;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

export function ModuleForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading, 
  mode 
}: ModuleFormProps) {
  const [formData, setFormData] = useState<ModuleFormData>({
    title: '',
    description: '',
    learningObjectives: [''],
  });

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    learningObjectives?: string;
  }>({});

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        learningObjectives: initialData.learningObjectives.length > 0 
          ? initialData.learningObjectives 
          : ['']
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const validObjectives = formData.learningObjectives.filter(obj => obj.trim());
    if (validObjectives.length === 0) {
      newErrors.learningObjectives = 'At least one learning objective is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (action: 'draft' | 'publish' = 'draft') => {
    console.log('Form submit called with action:', action);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    const cleanedObjectives = formData.learningObjectives.filter(obj => obj.trim());
    
    const submitData = {
      ...formData,
      learningObjectives: cleanedObjectives,
    };

    console.log('Submitting data:', submitData);
    onSubmit(submitData, action);
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }));
  };

  const removeObjective = (index: number) => {
    if (formData.learningObjectives.length > 1) {
      setFormData(prev => ({
        ...prev,
        learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
      }));
    }
  };

  const updateObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.map((obj, i) => 
        i === index ? value : obj
      )
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {mode === 'create' ? 'Create New Module' : 'Edit Module'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === 'create' 
                  ? 'Add a new learning module with objectives and content'
                  : 'Update your learning module details'
                }
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Module Title *</Label>
            <Input
              id="title"
              placeholder="Enter module title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what this module covers..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Learning Objectives */}
          <div className="space-y-3">
            <Label>Learning Objectives *</Label>
            <p className="text-sm text-muted-foreground">
              Define what learners will achieve after completing this module
            </p>
            
            <div className="space-y-3">
              {formData.learningObjectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder={`Learning objective ${index + 1}...`}
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      className={errors.learningObjectives && !objective.trim() ? "border-red-500" : ""}
                    />
                  </div>
                  {formData.learningObjectives.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeObjective(index)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addObjective}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Objective
            </Button>

            {errors.learningObjectives && (
              <p className="text-sm text-red-600">{errors.learningObjectives}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="order-3 sm:order-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <div className="flex gap-3 order-1 sm:order-2 sm:ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit('draft')}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                <FileText className="mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save as Draft'}
              </Button>
              
              <Button
                type="button"
                onClick={() => handleSubmit('publish')}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                <Eye className="mr-2 h-4 w-4" />
                {isLoading ? 'Publishing...' : 'Publish Module'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}