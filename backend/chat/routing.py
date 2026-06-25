from django.urls import re_path

from .consumers import ChatConsumer

# websocket_urlpatterns is what Django Channels looks for
websocket_urlpatterns = [
    
    re_path(r'ws/chat/(?P<room_id>\w+)/$', ChatConsumer.as_asgi()),
]