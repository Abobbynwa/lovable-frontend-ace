import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CodeInput = ({ value, onChange }: CodeInputProps) => {
  return (
    <InputOTP maxLength={6} value={value} onChange={onChange}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
};

export default CodeInput;
