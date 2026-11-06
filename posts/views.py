from rest_framework.generics import ListAPIView
from .models import Category, Post
from .pagination import FeedPagination
from .serializers import CategorySerializer, PostSerializer


class FeedView(ListAPIView):
    serializer_class = PostSerializer
    pagination_class = FeedPagination

    def get_queryset(self):
        return (
            Post.objects
            .filter(category__in=self.request.user.categories.all())
            .select_related('category')
        )


class CategoryListView(ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer