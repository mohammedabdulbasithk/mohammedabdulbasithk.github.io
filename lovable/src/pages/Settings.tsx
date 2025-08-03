import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface Settings {
  id: string;
  course_duration_days: number;
  fee_amount: number;
}

const Settings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [formData, setFormData] = useState({
    course_duration_days: 25,
    fee_amount: 1000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;

      setSettings(data);
      setFormData({
        course_duration_days: data.course_duration_days,
        fee_amount: data.fee_amount,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!settings) return;

      const { error } = await supabase
        .from('settings')
        .update(formData)
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });

      setSettings({ ...settings, ...formData });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading Settings...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure course duration and fee amount for your institution
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="course_duration_days">Course Duration (Days) *</Label>
              <Input
                id="course_duration_days"
                type="number"
                min="1"
                value={formData.course_duration_days}
                onChange={(e) => handleChange("course_duration_days", e.target.value)}
                placeholder="Enter course duration in days"
                required
              />
              <p className="text-sm text-muted-foreground">
                Number of days after which students need to renew their package
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee_amount">Fee Amount *</Label>
              <Input
                id="fee_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.fee_amount}
                onChange={(e) => handleChange("fee_amount", e.target.value)}
                placeholder="Enter fee amount"
                required
              />
              <p className="text-sm text-muted-foreground">
                Default fee amount for the course
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Current Configuration</h3>
              <div className="text-sm text-blue-700">
                <p>• Students will be reminded to renew after <strong>{formData.course_duration_days} days</strong></p>
                <p>• Default fee amount: <strong>₹{formData.fee_amount}</strong></p>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;