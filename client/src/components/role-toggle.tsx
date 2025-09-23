import { useRole } from "@/hooks/use-role";
import { Button } from "@/components/ui/button";

export function RoleToggle() {
  const { role, setRole } = useRole();

  return (
    <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
      <Button
        variant={role === "distributor" ? "default" : "ghost"}
        size="sm"
        onClick={() => setRole("distributor")}
        className={role === "distributor" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}
        data-testid="button-distributor-role"
      >
        Distributor
      </Button>
      <Button
        variant={role === "manufacturer" ? "default" : "ghost"}
        size="sm"
        onClick={() => setRole("manufacturer")}
        className={role === "manufacturer" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}
        data-testid="button-manufacturer-role"
      >
        Manufacturer
      </Button>
    </div>
  );
}
