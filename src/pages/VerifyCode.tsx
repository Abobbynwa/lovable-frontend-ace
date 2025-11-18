import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CodeInput from '@/components/CodeInput';
import { verifyCode } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ErrorAlert from '@/components/ErrorAlert';
import { toast } from 'sonner';

const VerifyCode = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { email, setTeacher, setIsVerified } = useAuth();

  if (!email) {
    navigate('/send-code');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await verifyCode(email, code);
      
      // Set teacher data from response
      if (response.teacher) {
        setTeacher(response.teacher);
      }
      
      setIsVerified(true);
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code sent to <br />
            <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorAlert message={error} />}
            
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <div className="flex justify-center">
                <CodeInput value={code} onChange={setCode} />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/send-code')}
            >
              Use a different email
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyCode;
