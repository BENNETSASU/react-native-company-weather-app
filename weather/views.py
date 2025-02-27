# weather/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationView(APIView):
    def get(self, request):
        # Fetch notifications that haven't been sent yet
        notifications = Notification.objects.filter(is_sent=False)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
