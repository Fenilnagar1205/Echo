from rest_framework.response import Response
from rest_framework import status

from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth.models import User

from django.contrib.auth import authenticate

from .models import Room, Message
from .serializers import (
    UserSerializer,
    MessageSerializer,
    RoomSerializer,
    RegisterSerializer
)


def get_tokens_for_user(user):

    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),              
        'access': str(refresh.access_token),    
    }


# Register API — anyone can access this (no login needed)
class RegisterView(APIView):
    permission_classes = [AllowAny]     # no authentication required

    def post(self, request):
    
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
        
            user = serializer.save()

            tokens = get_tokens_for_user(user)

            return Response({
                'tokens': tokens,                   
                'user': UserSerializer(user).data   
            }, status=status.HTTP_201_CREATED) 

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Login API — anyone can access this (no login needed)
class LoginView(APIView):
    permission_classes = [AllowAny]     

    def post(self, request):
    
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
        
            tokens = get_tokens_for_user(user)

            return Response({
                'tokens': tokens,           
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)       

        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED     # 401 = unauthorized
        )


# Rooms API — only logged in users can access
class RoomListView(APIView):
    permission_classes = [IsAuthenticated]      

    def get(self, request):
        
        rooms = Room.objects.filter(members=request.user)

        serializer = RoomSerializer(rooms, many=True)  

        return Response(serializer.data, status=status.HTTP_200_OK)
    

    def post(self, request):
        other_user_id = request.data.get('user_id')

        if not other_user_id:
            return Response(
            {'error': 'user_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

        if int(other_user_id) == request.user.id:
            return Response(
            {'error': 'You cannot create a room with yourself'},
            status=status.HTTP_400_BAD_REQUEST
        )

        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response(
            {'error': f'User with id {other_user_id} not found'},
            status=status.HTTP_404_NOT_FOUND     
        )

        existing_room = Room.objects.filter(
            members=request.user).filter(members=other_user).first()                       

        if existing_room:
            return Response(
            RoomSerializer(existing_room).data,
            status=status.HTTP_200_OK
        )

        room = Room.objects.create()

        room.members.add(request.user, other_user)

        return Response(
            RoomSerializer(room).data,
        status=status.HTTP_201_CREATED
    )


# Messages API — get and send messages in a room
class MessageListView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request, room_id):
        try:
            room = Room.objects.get(id=room_id, members=request.user)
        except Room.DoesNotExist:
            return Response(
                {'error': 'Room not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        messages = room.messages.all()

        serializer = MessageSerializer(messages, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)