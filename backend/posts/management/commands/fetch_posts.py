import random
import re
import groq
import requests
from django.core.management.base import BaseCommand
from django.utils import timezone
from posts import llm
from posts.models import Category, Post
from posts.sources import openverse, wikipedia
from posts.validation import missing_numbers

MAX_ATTEMPTS = 20
FACT_LIMIT = 300
DESCRIPTION_LIMIT = 1200


def make_fact(text):
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return ' '.join(sentences[:2])[:FACT_LIMIT]


def make_description(text):
    paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
    result = [paragraphs[0]]
    for paragraph in paragraphs[1:]:
        if len('\n\n'.join(result + [paragraph])) > DESCRIPTION_LIMIT:
            break
        result.append(paragraph)
    return '\n\n'.join(result)


class Command(BaseCommand):
    help = 'Fetch new posts from Wikipedia for each category'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=3, help='New posts per category')

    def handle(self, *args, **options):
        for category in Category.objects.exclude(wiki_categories=''):
            created = self.fill_category(category, options['count'])
            self.stdout.write(f'{category.name}: {created} new posts')

    def find_image(self, article, category):
        if article['image']:
            return article['image']
        try:
            return (
                wikipedia.search_commons_image(article['title'])
                or openverse.search_image(category.image_theme or category.name)
            )
        except requests.RequestException as error:
            self.stdout.write(self.style.WARNING(f'  [{article["title"]}] image search error: {error}'))
            return None

    def build_fact(self, article):
        title = article['title']
        try:
            fact = llm.rewrite_fact(title, article['text'])
        except groq.APIError as error:
            self.stdout.write(self.style.WARNING(f'  [{title}] fallback: API error: {error}'))
            return make_fact(article['text'])

        if not fact:
            self.stdout.write(self.style.WARNING(f'  [{title}] fallback: empty response'))
            return make_fact(article['text'])

        if len(fact) > FACT_LIMIT:
            self.stdout.write(self.style.WARNING(f'  [{title}] fallback: too long ({len(fact)} chars)'))
            return make_fact(article['text'])

        missing = missing_numbers(fact, article['text'])
        if missing:
            self.stdout.write(self.style.WARNING(f'  [{title}] fallback: unknown numbers {missing}'))
            self.stdout.write(f'    LLM wrote: {fact}')
            return make_fact(article['text'])

        return fact

    def fill_category(self, category, count):
        titles = []
        for line in category.wiki_categories.splitlines():
            if line.strip():
                titles += wikipedia.get_category_titles(line.strip())

        existing = set(Post.objects.values_list('title', flat=True))
        candidates = [title for title in titles if title not in existing]
        random.shuffle(candidates)

        created = 0
        for title in candidates[:MAX_ATTEMPTS]:
            if created >= count:
                break
            article = wikipedia.get_article(title)
            if article is None:
                continue

            image = self.find_image(article, category)
            if image is None:
                self.stdout.write(self.style.WARNING(f'  [{title}] skipped: no usable image'))
                continue

            _, was_created = Post.objects.get_or_create(
                source_url=article['url'],
                defaults={
                    'category': category,
                    'title': article['title'],
                    'fact': self.build_fact(article),
                    'description': make_description(article['text']),
                    'image_url': image['url'],
                    'image_attribution': image['attribution'],
                    'image_license': image['license'],
                    'image_source_url': image['source_url'],
                    'source_name': article['source_name'],
                    'text_license': article['text_license'],
                    'source_fetched_at': timezone.now(),
                },
            )
            if was_created:
                created += 1
        return created