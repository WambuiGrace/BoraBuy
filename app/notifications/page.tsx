"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Order",
      message: "You have received a new order #12345",
      type: "info",
      timestamp: "2024-02-20T10:00:00Z",
      read: false,
    },
    {
      id: "2",
      title: "Payment Success",
      message: "Payment for order #12345 has been processed successfully",
      type: "success",
      timestamp: "2024-02-20T09:30:00Z",
      read: true,
    },
    {
      id: "3",
      title: "Low Stock Alert",
      message: "Product 'Sample Product' is running low on stock",
      type: "warning",
      timestamp: "2024-02-20T09:00:00Z",
      read: false,
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="outline" onClick={markAllAsRead}>
          Mark all as read
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Notifications</h2>
            <Badge variant="secondary">
              {notifications.filter((n) => !n.read).length} unread
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{notification.title}</h3>
                        <Badge
                          variant="secondary"
                          className={getTypeColor(notification.type)}
                        >
                          {notification.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 