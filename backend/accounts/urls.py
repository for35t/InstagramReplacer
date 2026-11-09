from django.urls import path
from .views import LoginView, LogoutView, MyCategoriesView, RefreshView, RegisterView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', RefreshView.as_view(), name='token-refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('me/categories/', MyCategoriesView.as_view(), name='my-categories'),
]