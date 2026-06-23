from django.contrib import admin
from .models import Room, Message

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):

    list_display = ['id', 'created_at']

    list_filter = ['created_at']

@admin.register(Message)
class MessageAmin(admin.ModelAdmin):

    list_display = ['id', 'sender', 'room', 'timestamp']

    search_fields = ['sender__username', 'content']

    list_filter= ['timestamp']
