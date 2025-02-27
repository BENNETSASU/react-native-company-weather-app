# weather/admin.py

from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'message', 'sent_at', 'is_sent')
    actions = ['mark_as_sent']

    def mark_as_sent(self, request, queryset):
        queryset.update(is_sent=True)
