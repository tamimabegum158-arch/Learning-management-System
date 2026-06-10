package com.ailms.notification.service;

import com.ailms.notification.dto.NotificationResponse;
import java.util.List;

public interface NotificationService {
    void notifyUser(Long userId, String title, String message);
    List<NotificationResponse> myNotifications(String userEmail);
    NotificationResponse markAsRead(Long notificationId, String userEmail);
}
