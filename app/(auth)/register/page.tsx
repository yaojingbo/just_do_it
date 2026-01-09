import RegisterForm from '@/components/auth/RegisterForm';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <RegisterForm />
    </div>
  );
}
