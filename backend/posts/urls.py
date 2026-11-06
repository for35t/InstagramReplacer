from django.urls import path
from .views import CategoryListView, FeedView

urlpatterns = [
    path('feed/', FeedView.as_view(), name='feed'),
    path('categories/', CategoryListView.as_view(), name='categories'),
]