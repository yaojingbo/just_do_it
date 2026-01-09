'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';

// 记住密码的键名
const REMEMBER_CREDENTIALS_KEY = 'remembered_credentials';

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // 组件加载时检查是否有记住的凭据
  useEffect(() => {
    const rememberedCredentials = localStorage.getItem(REMEMBER_CREDENTIALS_KEY);
    if (rememberedCredentials) {
      try {
        const credentials = JSON.parse(rememberedCredentials);
        setFormData({
          email: credentials.email || '',
          password: credentials.password || '',
        });
        setRememberMe(true);
      } catch (error) {
        // 如果解析失败，清除错误的存储
        localStorage.removeItem(REMEMBER_CREDENTIALS_KEY);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 如果用户选择了记住密码，则保存凭据
    if (rememberMe) {
      localStorage.setItem(REMEMBER_CREDENTIALS_KEY, JSON.stringify(formData));
    } else {
      // 如果没有选择记住密码，则清除已保存的凭据
      localStorage.removeItem(REMEMBER_CREDENTIALS_KEY);
    }

    const success = await login(formData);
    if (success) {
      router.push('/');
    }
  };

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);

    // 如果取消勾选，立即清除存储的凭据
    if (!checked) {
      localStorage.removeItem(REMEMBER_CREDENTIALS_KEY);
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
        <CardTitle className="text-2xl font-bold text-center">登录</CardTitle>
        <CardDescription className="text-center">
          登录到您的家庭开销记录器账户
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
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
              autoComplete="current-password"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => handleRememberMeChange(e.target.checked)}
                className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary"
              />
              <label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                记住密码
              </label>
            </div>
            <button
              type="button"
              onClick={() => setForgotPasswordOpen(true)}
              className="text-sm text-primary hover:underline font-medium"
            >
              忘记密码？
            </button>
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '登录中...' : '登录'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            还没有账户？{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="text-primary hover:underline font-medium"
            >
              立即注册
            </button>
          </p>
        </CardFooter>
      </form>
      <ForgotPasswordDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </Card>
  );
}
