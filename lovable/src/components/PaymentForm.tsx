import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addDays } from "date-fns";

interface Student {
  id: string;
  name: string;
  place: string;
  phone_number: string;
  admission_date: string;
  is_active: boolean;
}

interface PaymentFormProps {
  student: Student;
  courseDuration: number;
  defaultAmount: number;
  onSuccess: () => void;
}

const PaymentForm = ({ student, courseDuration, defaultAmount, onSuccess }: PaymentFormProps) => {
  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount: defaultAmount.toString(),
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateNextPaymentDate = (paymentDate: string) => {
    return addDays(new Date(paymentDate), courseDuration).toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const nextPaymentDate = calculateNextPaymentDate(formData.payment_date);
      
      const { error } = await supabase
        .from('payments')
        .insert([{
          student_id: student.id,
          payment_date: formData.payment_date,
          amount: parseFloat(formData.amount),
          next_payment_date: nextPaymentDate,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
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
      <div className="bg-muted p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">Student Details</h3>
        <p><strong>Name:</strong> {student.name}</p>
        <p><strong>Place:</strong> {student.place}</p>
        <p><strong>Phone:</strong> {student.phone_number}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment_date">Payment Date *</Label>
        <Input
          id="payment_date"
          type="date"
          value={formData.payment_date}
          onChange={(e) => handleChange("payment_date", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          placeholder="Enter payment amount"
          required
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Next Payment Due:</strong> {calculateNextPaymentDate(formData.payment_date)}
          <br />
          <span className="text-xs">
            (Based on {courseDuration} days course duration)
          </span>
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Recording..." : "Record Payment"}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;