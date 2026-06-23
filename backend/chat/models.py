from django.db import models
from django.contrib.auth.models import User

# Room Model - represents chat between two users
class Room(models.Model):

    members = models.ManyToManyField(
        User,
        related_name='rooms'
    )

    created_at =  models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Room: {', '.join([user.username for user in self.members.all()])}"


# Message Model - represents a single message inside a room
class Message(models.Model):
    
    room = models.ForeignKey(
        Room,
        on_delete = models.CASCADE,
        related_name='messages'
    )

    sender = models.ForeignKey(
        User,
        on_delete = models.CASCADE,
        related_name='messages'
    )

    content = models.TextField()

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}"


    
