import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";
import { Button } from "./button";

export const Default = () => (
  <Card className="max-w-sm">
    <CardHeader>
      <CardTitle>Título do Card</CardTitle>
      <CardDescription>Descrição de suporte do card.</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Conteúdo do card vai aqui.</p>
    </CardContent>
  </Card>
);

export const WithFooter = () => (
  <Card className="max-w-sm">
    <CardHeader>
      <CardTitle>Card com Footer</CardTitle>
      <CardDescription>Exemplo com ação no rodapé.</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Algum conteúdo relevante.</p>
    </CardContent>
    <CardFooter>
      <Button size="sm">Ação</Button>
    </CardFooter>
  </Card>
);

export const Small = () => (
  <Card size="sm" className="max-w-xs">
    <CardHeader>
      <CardTitle>Card Compacto</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Versão menor do card.</p>
    </CardContent>
  </Card>
);
