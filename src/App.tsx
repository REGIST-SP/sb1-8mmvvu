import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProcurementForm } from '@/components/ProcurementForm';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-2xl">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Форма закупки
            </CardTitle>
            <CardDescription className="text-center">
              Введите данные закупки ниже
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProcurementForm />
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}

export default App;