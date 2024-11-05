import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeDollarSign, Building2, Percent, ShoppingCart } from 'lucide-react';
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
import { useState } from 'react';

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
});

export function ProcurementForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      procurementNumber: '',
      stopPrice: '',
      inn: '',
      dropPercentage: '',
    },
  });

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
        <FormField
          control={form.control}
          name="procurementNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Номер закупки</FormLabel>
              <FormControl>
                <div className="relative">
                  <ShoppingCart className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Введите номер закупки"
                    className="pl-10"
                    {...field}
                  />
                </div>
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
                <div className="relative">
                  <BadgeDollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Введите стоп-цену"
                    className="pl-10"
                    {...field}
                  />
                </div>
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
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input placeholder="Введите ИНН" className="pl-10" {...field} />
                </div>
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
                <div className="relative">
                  <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Введите процент падения"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Процент снижения от начальной цены
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Отправка...' : 'Отправить форму'}
        </Button>
      </form>
    </Form>
  );
}