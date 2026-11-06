from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)
    wiki_categories = models.TextField(blank=True, help_text='One Wikipedia category per line, without "Category:"')

    class Meta:
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Post(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    fact = models.CharField(max_length=300)
    description = models.TextField()
    image_url = models.URLField(max_length=500, blank=True)
    image_attribution = models.CharField(max_length=300, blank=True)
    image_license = models.CharField(max_length=50, blank=True)
    source_url = models.URLField(max_length=500, unique=True)
    source_name = models.CharField(max_length=50, default='Wikipedia')
    text_license = models.CharField(max_length=50, default='CC BY-SA 4.0')
    source_fetched_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title