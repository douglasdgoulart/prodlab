import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./card";
import { Button } from "./button";
import { Badge } from "./badge";

export default {
  title: "UI / Card",
};

export const Variants = () => (
  <div className="flex flex-col gap-6 max-w-lg">
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">default</p>
      <Card>
        <CardHeader>
          <CardTitle>Título do Card</CardTitle>
          <CardDescription>Descrição de suporte com contexto adicional.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Conteúdo principal do card.</p>
        </CardContent>
      </Card>
    </div>

    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">size="sm"</p>
      <Card size="sm">
        <CardHeader>
          <CardTitle>Card Compacto</CardTitle>
          <CardDescription>Versão menor para listas densas.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Conteúdo com menos padding.</p>
        </CardContent>
      </Card>
    </div>

    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">com action + footer</p>
      <Card>
        <CardHeader>
          <CardTitle>Card com Ação</CardTitle>
          <CardAction>
            <Badge variant="secondary">Novo</Badge>
          </CardAction>
          <CardDescription>Header com slot de ação no canto.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Conteúdo do card com footer abaixo.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Confirmar</Button>
        </CardFooter>
      </Card>
    </div>
  </div>
);
