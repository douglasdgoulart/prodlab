import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuCheckboxItem,
} from "./dropdown-menu";
import { Button } from "./button";
import { useState } from "react";

export default {
  title: "UI / DropdownMenu",
};

export const Variants = () => {
  const [checked, setChecked] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-mono text-muted-foreground mb-3">default</p>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline">Abrir Menu</Button>} />
          <DropdownMenuContent>
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                Perfil
                <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Configurações
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              Sair
              <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <p className="text-xs font-mono text-muted-foreground mb-3">com checkbox</p>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline">Opções</Button>} />
          <DropdownMenuContent>
            <DropdownMenuLabel>Preferências</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
              Notificações ativas
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={false}>
              Modo escuro
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
