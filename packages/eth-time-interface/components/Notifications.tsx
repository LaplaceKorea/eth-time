import React, { useMemo } from "react";
import { useNotifications, Notification, useEthers } from "@usedapp/core";
import { styled, theme } from "../stitches.config";

const NotificationsRoot = styled("div", {
  display: "flex",
  flexDirection: "column",
  paddingTop: "2rem",
  paddingRight: "2rem",
});

const NotificationBubbleRoot = styled("div", {
  margin: "0px 1rem",
  fontSize: "1rem",
  borderRadius: "5px",
  padding: "1rem 3rem",
  cursor: "pointer",
  variants: {
    notificationType: {
      walletConnected: {
        border: `1px solid ${theme.colors.orange}`,
        boxShadow: `5px 5px ${theme.colors.orange}`,
      },
      transactionStarted: {
        border: `1px solid ${theme.colors.blue}`,
        boxShadow: `5px 5px ${theme.colors.blue}`,
      },
      transactionSucceed: {
        border: `1px solid ${theme.colors.green}`,
        boxShadow: `5px 5px ${theme.colors.green}`,
      },
      transactionFailed: {
        border: `1px solid ${theme.colors.red}`,
        boxShadow: `5px 5px ${theme.colors.red}`,
      },
    },
  },
});

interface NotificationBubbleProps {
  notification: Notification;
}

function NotificationBubble({ notification }: NotificationBubbleProps) {
  const { chainId } = useEthers();
  const { removeNotification } = useNotifications();

  const bubbleText = useMemo(() => {
    if (notification.type === "walletConnected") {
      return "Wallet Connected";
    }
    if (notification.type === "transactionStarted") {
      return `${notification.transactionName} Transaction Submitted`;
    }
    if (notification.type === "transactionSucceed") {
      return `${notification.transactionName} Transaction Succeed`;
    }
    if (notification.type === "transactionFailed") {
      return `${notification.transactionName} Transaction Failed`;
    }
    return;
  }, [notification]);
  return (
    bubbleText && (
      <NotificationBubbleRoot
        notificationType={notification.type}
        onClick={() =>
          removeNotification({ notificationId: notification.id, chainId })
        }
      >
        {bubbleText}
      </NotificationBubbleRoot>
    )
  );
}

export function Notifications() {
  const { notifications } = useNotifications();
  return (
    <NotificationsRoot>
      {notifications.map((notification) => (
        <NotificationBubble key={notification.id} notification={notification} />
      ))}
    </NotificationsRoot>
  );
}
