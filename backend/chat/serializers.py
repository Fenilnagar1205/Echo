from rest_framework import serializers

from django.contrib.auth.models import User

from .models import Room, Message

# serializer for User Model
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


#serializer for Messagge Model
class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.SerializerMethodField()

    class Meta:
        model = Message
       
        fields = ['id', 'sender', 'sender_username', 'content', 'timestamp']
       
        extra_kwargs = {'sender': {'write_only': True}}
    
    def get_sender_username(self, obj):
        return obj.sender.username


# Serializer for Room model
class RoomSerializer(serializers.ModelSerializer):

    members = UserSerializer(many=True, read_only=True)

    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ['id', 'members', 'created_at', 'last_message']

    def get_last_message(self, obj):
        
        last = obj.messages.last()     

      
        if last is None:
            return None

        
        return MessageSerializer(last).data    


# Serializer for user Registration
class RegisterSerializer(serializers.ModelSerializer):
    
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    
    def create(self, validated_data):
    
        user = User.objects.create_user(
            username=validated_data['username'],   
            email=validated_data['email'],         
            password=validated_data['password']     
        )
        return user
