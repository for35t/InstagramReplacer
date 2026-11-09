import random
import re
import groq
import requests
from django.core.management.base import BaseCommand
from django.utils import timezone
from posts import llm
from posts.models import Category, Post
from posts.sources import wikipedia
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
                try:
                    titles += wikipedia.get_category_titles(line.strip())
                except requests.RequestException as error:
                    self.stdout.write(self.style.WARNING(f'  [{line.strip()}] skipped: {error}'))

        existing = set(Post.objects.values_list('title', flat=True))
        candidates = [title for title in titles if title not in existing]
        random.shuffle(candidates)

        created = 0
        for title in candidates[:MAX_ATTEMPTS]:
            if created >= count:
                break
            try:
                article = wikipedia.get_article(title)
            except requests.RequestException as error:
                self.stdout.write(self.style.WARNING(f'  [{title}] skipped: {error}'))
                continue
            if article is None:
                continue
            _, was_created = Post.objects.get_or_create(
                source_url=article['url'],
                defaults={
                    'category': category,
                    'title': article['title'],
                    'fact': self.build_fact(article),
                    'description': make_description(article['text']),
                    'image_url': article['image_url'],
                    'image_attribution': article['image_attribution'],
                    'image_license': article['image_license'],
                    'source_name': article['source_name'],
                    'text_license': article['text_license'],
                    'source_fetched_at': timezone.now(),
                },
            )
            if was_created:
                created += 1
        return created