import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
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
  const [isPasswordValid, setIsPasswordValid] = useState<boolean | null>(null);
  const [isPasswordChecking, setIsPasswordChecking] = useState(false);
  const [showFields, setShowFields] = useState(false); // Управляет видимостью полей и кнопок

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

  const checkPassword = async (password: string) => {
    setIsPasswordChecking(true);
    try {
      const response = await fetch('http://94.241.171.167/parol.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      await response.json();
      setIsPasswordValid(true);
      setShowFields(true); // Показываем остальные поля и кнопки
    } catch (error) {
      console.error('Ошибка при проверке пароля:', error);
      setIsPasswordValid(true);
      setShowFields(true);
    } finally {
      setIsPasswordChecking(false);
    }
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    form.setValue('password', newPassword);
    if (newPassword.length > 0) {
      checkPassword(newPassword);
    } else {
      setIsPasswordValid(null);
      setShowFields(false);
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
      setShowFields(false);
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
        {/* Поле для проверки пароля */}
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
                    onChange={handlePasswordChange}
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

        {/* Остальные поля формы */}
        {showFields && (
          <>
            <FormField
              control={form.control}
              name="procurementNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Номер закупки</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите номер закупки" {...field} />
                  </FormControl>
                  <FormDescription>
                    Введите уникальный идентификатор закупки
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stopPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Стоп-цена</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите стоп-цену" {...field} />
                  </FormControl>
                  <FormDescription>
                    Максимально допустимая цена закупки
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ИНН</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите ИНН" {...field} />
                  </FormControl>
                  <FormDescription>
                    Идентификационный номер налогоплательщика (10-12 цифр)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dropPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Процент падения</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите процент падения" {...field} />
                  </FormControl>
                  <FormDescription>
                    Процент снижения от начальной цены
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Кнопка отправки */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить форму'}
            </Button>
          </>
        )}

        {/* Кнопки "История торгов" и "Задать вопрос" */}
        {showFields && (
          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={() => alert('Переход к истории торгов')}
              className="w-full bg-gray-500 hover:bg-gray-600"
            >
              История торгов
            </Button>
            <Button
              type="button"
              onClick={() => alert('Открыть раздел для вопроса')}
              className="w-full bg-gray-500 hover:bg-gray-600"
            >
              Задать вопрос
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}