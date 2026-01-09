'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

export default function RegisterForm() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 密码规则检查
  const passwordRules = [
    {
      label: '至少8个字符',
      test: (pwd: string) => pwd.length >= 8,
    },
    {
      label: '不超过100个字符',
      test: (pwd: string) => pwd.length <= 100,
    },
    {
      label: '包含至少一个字母',
      test: (pwd: string) => /[a-zA-Z]/.test(pwd),
    },
    {
      label: '包含至少一个数字',
      test: (pwd: string) => /[0-9]/.test(pwd),
    },
  ];

  const getPasswordStrength = () => {
    const passedRules = passwordRules.filter(rule => rule.test(formData.password)).length;
    return passedRules;
  };

  const isPasswordValid = () => {
    return passwordRules.every(rule => rule.test(formData.password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('密码不匹配');
      return;
    }

    if (!isPasswordValid()) {
      alert('请确保密码符合所有规则要求');
      return;
    }

    const success = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (success) {
      router.push('/');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Card className="w-full max-w-md mx-4 sm:mx-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">注册</CardTitle>
        <CardDescription className="text-center">
          创建您的家庭开销记录器账户
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              姓名
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="请输入姓名"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              邮箱
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="请输入邮箱"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              密码
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="请输入密码"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className={formData.password && !isPasswordValid() ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {formData.password && (
              <div className="space-y-2 mt-2">
                <p className="text-xs font-medium text-muted-foreground">密码要求：</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {passwordRules.map((rule, index) => {
                    const isValid = rule.test(formData.password);
                    return (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {isValid ? (
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className={isValid ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">密码强度：</span>
                      <span className={`font-medium ${
                        getPasswordStrength() === passwordRules.length
                          ? 'text-green-600 dark:text-green-400'
                          : getPasswordStrength() >= passwordRules.length * 0.75
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                      }`}>
                        {getPasswordStrength() === passwordRules.length
                          ? '强'
                          : getPasswordStrength() >= passwordRules.length * 0.75
                            ? '中等'
                            : '弱'}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          getPasswordStrength() === passwordRules.length
                            ? 'bg-green-500'
                            : getPasswordStrength() >= passwordRules.length * 0.75
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${(getPasswordStrength() / passwordRules.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              确认密码
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '注册中...' : '注册'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            已有账户？{' '}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-primary hover:underline font-medium"
            >
              立即登录
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
