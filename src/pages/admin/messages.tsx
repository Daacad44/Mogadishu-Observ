import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Loader2 } from "lucide-react";
import { contactService } from "@/services/api";
import { formatDate } from "@/utils";

const statusColors: Record<string, "default" | "secondary" | "success"> = {
  new: "default",
  read: "secondary",
  archived: "secondary",
};

export default function AdminMessagesPage() {
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: () => contactService.getAll(),
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact Messages</h1>
        <p className="text-sm text-muted-foreground">
          Submissions from the public contact form (<code className="text-xs">contact_messages</code> table)
        </p>
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Inbox ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No messages yet. Submissions from the Contact page appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-lg border border-border/50 hover:bg-glass transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{msg.name}</p>
                        <Badge variant={statusColors[msg.status]} className="text-[10px]">
                          {msg.status}
                        </Badge>
                      </div>
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {msg.email}
                      </a>
                      {msg.subject && (
                        <p className="text-sm font-medium mt-2">{msg.subject}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
