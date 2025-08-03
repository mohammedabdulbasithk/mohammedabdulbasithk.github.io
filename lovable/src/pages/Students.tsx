import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { format, addDays, isAfter, isBefore, isToday } from "date-fns";
import StudentForm from "@/components/StudentForm";
import PaymentForm from "@/components/PaymentForm";

interface Student {
  id: string;
  name: string;
  place: string;
  phone_number: string;
  admission_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: string;
  student_id: string;
  payment_date: string;
  amount: number;
  next_payment_date: string;
  created_at: string;
}

interface Settings {
  course_duration_days: number;
  fee_amount: number;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<Settings>({ course_duration_days: 25, fee_amount: 1000 });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (settingsError) throw settingsError;
      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStudentStatus = (student: Student) => {
    const latestPayment = payments
      .filter(p => p.student_id === student.id)
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0];

    if (!latestPayment) {
      // Check if admission was more than course duration ago
      const expectedExpiryDate = addDays(new Date(student.admission_date), settings.course_duration_days);
      if (isAfter(new Date(), expectedExpiryDate)) {
        return { status: 'expired', nextPaymentDate: expectedExpiryDate };
      }
      return { status: 'active', nextPaymentDate: expectedExpiryDate };
    }

    const nextPaymentDate = new Date(latestPayment.next_payment_date);
    const today = new Date();

    if (isBefore(nextPaymentDate, today)) {
      return { status: 'expired', nextPaymentDate };
    } else if (isToday(nextPaymentDate)) {
      return { status: 'due_today', nextPaymentDate };
    } else {
      return { status: 'active', nextPaymentDate };
    }
  };

  const filteredStudents = students
    .filter(student => {
      if (!student.is_active) return false;
      
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.phone_number.includes(searchTerm);

      if (filterType === 'all') return matchesSearch;
      
      const studentStatus = getStudentStatus(student);
      
      switch (filterType) {
        case 'due_today':
          return matchesSearch && studentStatus.status === 'due_today';
        case 'expired':
          return matchesSearch && studentStatus.status === 'expired';
        case 'active':
          return matchesSearch && studentStatus.status === 'active';
        default:
          return matchesSearch;
      }
    });

  const handleDeleteStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ is_active: false })
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student deactivated successfully",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deactivating student:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate student",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (student: Student) => {
    const studentStatus = getStudentStatus(student);
    
    switch (studentStatus.status) {
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'due_today':
        return <Badge variant="secondary">Due Today</Badge>;
      case 'active':
        return <Badge variant="default">Active</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Student Management</h1>
        
        <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedStudent ? 'Edit Student' : 'Add New Student'}
              </DialogTitle>
            </DialogHeader>
            <StudentForm
              student={selectedStudent}
              onSuccess={() => {
                setIsStudentDialogOpen(false);
                setSelectedStudent(null);
                fetchData();
              }}
              onCancel={() => {
                setIsStudentDialogOpen(false);
                setSelectedStudent(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, place, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="due_today">Due Today</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Place</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const studentStatus = getStudentStatus(student);
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.place}</TableCell>
                      <TableCell>{student.phone_number}</TableCell>
                      <TableCell>{format(new Date(student.admission_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(student)}</TableCell>
                      <TableCell>
                        {format(studentStatus.nextPaymentDate, 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsStudentDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedStudent(student)}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Payment for {student.name}</DialogTitle>
                              </DialogHeader>
                              <PaymentForm
                                student={student}
                                courseDuration={settings.course_duration_days}
                                defaultAmount={settings.fee_amount}
                                onSuccess={() => {
                                  fetchData();
                                }}
                              />
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm('Are you sure you want to deactivate this student?')) {
                                handleDeleteStudent(student.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No students found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Students;