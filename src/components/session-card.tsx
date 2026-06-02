import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LEVEL_LABELS } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/utils";

export interface SessionCardData {
  id: string;
  startsAt: Date;
  capacity: number;
  available?: number;
  class: {
    name: string;
    level: string;
    style: { name: string; accentColor: string | null };
  };
  instructor: { fullName: string };
  room?: { name: string } | null;
}

export function SessionCard({
  session,
  action,
}: {
  session: SessionCardData;
  action?: React.ReactNode;
}) {
  const accent = session.class.style.accentColor ?? "#e11d48";
  const available = session.available;
  return (
    <Card className="overflow-hidden transition-transform hover:-translate-y-0.5">
      <div className="h-1 w-full" style={{ backgroundColor: accent }} />
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge variant="secondary" className="mb-2">
              {session.class.style.name}
            </Badge>
            <h3 className="font-display text-lg font-bold leading-tight">
              {session.class.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              con {session.instructor.fullName}
            </p>
          </div>
          <Badge variant="outline">
            {LEVEL_LABELS[session.class.level] ?? session.class.level}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" /> {formatDate(session.startsAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" /> {formatTime(session.startsAt)}
          </span>
          {session.room ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" /> {session.room.name}
            </span>
          ) : null}
          {typeof available === "number" ? (
            <span className="flex items-center gap-1.5">
              <Users className="size-4" />
              {available > 0 ? `${available} lugares` : "Lleno"}
            </span>
          ) : null}
        </div>

        {action ? <div className="pt-1">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
