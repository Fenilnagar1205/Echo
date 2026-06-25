import json  

from channels.generic.websocket import AsyncWebsocketConsumer

from channels.db import database_sync_to_async

from .models import Room, Message

from .serializers import MessageSerializer

from django.contrib.auth.models import User


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        
        self.room_id = self.scope['url_route']['kwargs']['room_id']

        self.room_group_name = f'chat_room_{self.room_id}'

        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        is_member = await self.check_room_membership()

        if not is_member:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,  
            self.channel_name       
        )

        await self.accept()

        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to chat!'
        }))


    async def disconnect(self, close_code):
        
        await self.channel_layer.group_discard(
            self.room_group_name,   
            self.channel_name       
        )


    async def receive(self, text_data):

        text_data_json = json.loads(text_data)

        content = text_data_json.get('content')

        if not content:
            return

        message = await self.save_message(content)

        serialized = await self.serialize_message(message)

        await self.channel_layer.group_send(
            self.room_group_name,  
            {
                'type': 'chat_message',   
                'message': serialized       
            }
        )


    async def chat_message(self, event):
        
        message = event['message']

        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))



    @database_sync_to_async
    def check_room_membership(self):
    
        return Room.objects.filter(
            id=self.room_id,
            members=self.user
        ).exists()     

    @database_sync_to_async
    def save_message(self, content):
    
        room = Room.objects.get(id=self.room_id)

        message = Message.objects.create(
            room=room,
            sender=self.user,   
            content=content     
        )
        return message

    @database_sync_to_async
    def serialize_message(self, message):
        return MessageSerializer(message).data