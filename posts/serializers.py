from rest_framework import serializers
from .models import Category, Post


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class PostSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'category', 'title', 'fact', 'description',
            'image_url', 'image_attribution', 'image_license',
            'source_name', 'source_url', 'text_license', 'created_at',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not instance.image_license:
            data['image_url'] = ''
            data['image_attribution'] = ''
        return data