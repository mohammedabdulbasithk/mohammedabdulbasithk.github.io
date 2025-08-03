import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  place: string;
  phone_number: string;
  admission_date: string;
  is_active: boolean;
}

interface StudentFormProps {
  student?: Student | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const StudentForm = ({ student, onSuccess, onCancel }: StudentFormProps) => {
  const [formData, setFormData] = useState({
    name: student?.name || "",
    place: student?.place || "",
    phone_number: student?.phone_number || "",
    admission_date: student?.admission_date || new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (student) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update(formData)
          .eq('id', student.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      } else {
        // Create new student
        const { error } = await supabase
          .from('students')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Student added successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: "Error",
        description: "Failed to save student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter student name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="place">Place *</Label>
        <Input
          id="place"
          value={formData.place}
          onChange={(e) => handleChange("place", e.target.value)}
          placeholder="Enter place"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone_number">Phone Number *</Label>
        <Input
          id="phone_number"
          value={formData.phone_number}
          onChange={(e) => handleChange("phone_number", e.target.value)}
          placeholder="Enter phone number"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="admission_date">Admission Date *</Label>
        <Input
          id="admission_date"
          type="date"
          value={formData.admission_date}
          onChange={(e) => handleChange("admission_date", e.target.value)}
          required
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : student ? "Update Student" : "Add Student"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;