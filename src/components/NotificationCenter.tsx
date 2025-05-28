
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Users, Database, AlertTriangle, Info } from "lucide-react";
import { format } from "date-fns";

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  user?: string;
  table?: string;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Mock notifications - in real app, these would come from WebSocket or polling
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'User Connected',
        message: 'editor@example.com has connected to the database',
        timestamp: new Date().toISOString(),
        read: false,
        user: 'editor@example.com'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Data Modified',
        message: 'Record in vp-v10-applications was updated by admin@example.com',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        read: false,
        user: 'admin@example.com',
        table: 'vp-v10-applications'
      },
      {
        id: '3',
        type: 'success',
        title: 'Backup Completed',
        message: 'Automatic backup completed successfully (2.4 MB)',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        read: true
      },
      {
        id: '4',
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to connect to table vp-sql-logs. Retrying...',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        read: false,
        table: 'vp-sql-logs'
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <Database className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = showAll ? notifications : notifications.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <CardTitle className="text-lg">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button size="sm" variant="outline" onClick={markAllAsRead}>
                Mark All Read
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : 'Show All'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {displayNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          displayNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border rounded-lg transition-colors ${
                notification.read ? 'bg-muted/30' : 'bg-background border-primary/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  {getIcon(notification.type)}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{format(new Date(notification.timestamp), 'MMM dd, HH:mm')}</span>
                      {notification.user && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {notification.user}
                        </span>
                      )}
                      {notification.table && (
                        <span className="flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          {notification.table}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteNotification(notification.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
