import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
// import { BadgeDollarSign, Building2, Percent, ShoppingCart, Lock } from 'lucide-react';
import {Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  procurementNumber: z
    .string()
    .min(1, 'Номер закупки обязателен')
    .regex(/^\d+$/, 'Должны быть только цифры'),
  stopPrice: z
    .string()
    .min(1, 'Стоп-цена обязательна')
    .regex(/^\d+(\.\d{1,2})?$/, 'Должна быть корректная цена'),
  inn: z
    .string()
    .min(10, 'ИНН должен содержать минимум 10 цифр')
    .max(12, 'ИНН не должен превышать 12 цифр')
    .regex(/^\d+$/, 'Должны быть только цифры'),
  dropPercentage: z
    .string()
    .min(1, 'Процент падения обязателен')
    .regex(/^\d+(\.\d{1,2})?$/, 'Должен быть корректный процент')
    .refine((val) => parseFloat(val) <= 100, 'Процент не должен превышать 100'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

export function ProcurementForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean | null>(null); // Для хранения состояния проверки пароля
  const [isPasswordChecking, setIsPasswordChecking] = useState(false); // Состояние загрузки при проверке пароля

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      procurementNumber: '',
      stopPrice: '',
      inn: '',
      dropPercentage: '',
      password: '',
    },
  });

  // Функция для проверки пароля
  const checkPassword = async (password: string) => {
    setIsPasswordChecking(true);
    try {
      const response = await fetch('http://94.241.171.167/parol.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      setIsPasswordValid(data.success); // Установка результата проверки
    } catch (error) {
      console.error('Ошибка при проверке пароля:', error);
      setIsPasswordValid(false); // Ошибка при запросе
    } finally {
      setIsPasswordChecking(false);
    }
  };

  // Обработчик изменения поля пароля
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    form.setValue('password', newPassword); // Устанавливаем значение в форму
    if (newPassword.length > 0) {
      checkPassword(newPassword); // Проверяем пароль, если он не пуст
    } else {
      setIsPasswordValid(null); // Сбрасываем состояние, если поле пустое
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch('https://api.example.com/procurement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Ошибка сети');
      }

      const data = await response.json();
      console.log(data);
      toast({
        title: 'Успешно!',
        description: 'Данные закупки успешно отправлены.',
        variant: 'default',
      });

      form.reset();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при отправке данных. Пожалуйста, попробуйте снова.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Другие поля формы остаются без изменений */}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Введите пароль"
                    className={`pl-10 ${
                      isPasswordValid === false ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...field}
                    onChange={handlePasswordChange} // Используем обработчик изменения
                  />
                </div>
              </FormControl>
              <FormDescription>
                Пароль для подтверждения закупки
              </FormDescription>
              <FormMessage />
              {isPasswordChecking && <p>Проверка пароля...</p>}
              {isPasswordValid === true && <p className="text-green-500">Пароль верный</p>}
              {isPasswordValid === false && <p className="text-red-500">Пароль неверный</p>}
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          disabled={isSubmitting || isPasswordValid === false} // Блокируем отправку при неверном пароле
        >
          {isSubmitting ? 'Отправка...' : 'Отправить форму'}
        </Button>
      </form>
    </Form>
  );
}
