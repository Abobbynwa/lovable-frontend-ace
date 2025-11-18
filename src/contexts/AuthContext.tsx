import React, { createContext, useContext, useState, useEffect } from 'react';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  teacher: Teacher | null;
  email: string | null;
  isVerified: boolean;
  setEmail: (email: string) => void;
  setTeacher: (teacher: Teacher) => void;
  setIsVerified: (verified: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teacher, setTeacherState] = useState<Teacher | null>(null);
  const [email, setEmailState] = useState<string | null>(null);
  const [isVerified, setIsVerifiedState] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const storedTeacher = localStorage.getItem('teacher');
    const storedEmail = localStorage.getItem('email');
    const storedVerified = localStorage.getItem('isVerified');

    if (storedTeacher) {
      setTeacherState(JSON.parse(storedTeacher));
    }
    if (storedEmail) {
      setEmailState(storedEmail);
    }
    if (storedVerified === 'true') {
      setIsVerifiedState(true);
    }
  }, []);

  const setEmail = (email: string) => {
    setEmailState(email);
    localStorage.setItem('email', email);
  };

  const setTeacher = (teacher: Teacher) => {
    setTeacherState(teacher);
    localStorage.setItem('teacher', JSON.stringify(teacher));
  };

  const setIsVerified = (verified: boolean) => {
    setIsVerifiedState(verified);
    localStorage.setItem('isVerified', verified.toString());
  };

  const logout = () => {
    setTeacherState(null);
    setEmailState(null);
    setIsVerifiedState(false);
    localStorage.removeItem('teacher');
    localStorage.removeItem('email');
    localStorage.removeItem('isVerified');
  };

  return (
    <AuthContext.Provider
      value={{
        teacher,
        email,
        isVerified,
        setEmail,
        setTeacher,
        setIsVerified,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
