import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudents } from '@/lib/supabase-api';
import ErrorAlert from '@/components/ErrorAlert';
import { TableSkeleton } from '@/components/LoadingSkeleton';

const Students = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">My Students</h2>
      {error && <ErrorAlert message={error} />}
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>Student List</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <TableSkeleton /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.roll_number}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/students/${s.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Students;
