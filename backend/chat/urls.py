from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterView, LoginView, RoomListView, MessageListView,UserSearchView

urlpatterns = [
    # auth routes
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),

    # JWT refresh route — React sends refresh token → gets new access token
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # room routes
    path('rooms/', RoomListView.as_view(), name='rooms'),

    # messages route — <int:room_id> captures the room ID from URL
    # example: /api/rooms/3/messages/ → room_id = 3
    path('rooms/<int:room_id>/messages/', MessageListView.as_view(), name='messages'),

    path('users/search/', UserSearchView.as_view(), name='user-search'),
]