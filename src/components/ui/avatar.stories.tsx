import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from "./avatar";

export default {
  title: "UI / Avatar",
};

export const Variants = () => (
  <div className="flex flex-col gap-6">
    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">sizes</p>
      <div className="flex items-center gap-4">
        <Avatar size="sm">
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <Avatar size="default">
          <AvatarFallback>DF</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
      </div>
    </div>

    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">com imagem</p>
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="https://api.dicebear.com/9.x/initials/svg?seed=DG" alt="DG" />
          <AvatarFallback>DG</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://api.dicebear.com/9.x/initials/svg?seed=PL" alt="PL" />
          <AvatarFallback>PL</AvatarFallback>
        </Avatar>
      </div>
    </div>

    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">com badge</p>
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          <AvatarFallback>ON</AvatarFallback>
          <AvatarBadge className="bg-green-500" />
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>OF</AvatarFallback>
          <AvatarBadge className="bg-muted-foreground" />
        </Avatar>
      </div>
    </div>

    <div>
      <p className="text-xs font-mono text-muted-foreground mb-3">grupo</p>
      <AvatarGroup>
        <Avatar>
          <AvatarFallback>A1</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>A2</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>A3</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+5</AvatarGroupCount>
      </AvatarGroup>
    </div>
  </div>
);
