from html import unescape
import requests
from django.utils.html import strip_tags
from .licenses import is_allowed

API_URL = 'https://en.wikipedia.org/w/api.php'
HEADERS = {'User-Agent': 'InstagramReplacer/0.1 (forestzoto@gmail.com)'}
MIN_TEXT_LENGTH = 300
IMAGE_WIDTH = 1080


def _get(params):
    params = {**params, 'format': 'json', 'formatversion': 2}
    response = requests.get(API_URL, params=params, headers=HEADERS, timeout=10)
    response.raise_for_status()
    return response.json()


def get_category_titles(category):
    params = {
        'action': 'query',
        'list': 'categorymembers',
        'cmtitle': f'Category:{category}',
        'cmtype': 'page',
        'cmlimit': 500,
    }
    titles = []
    while True:
        data = _get(params)
        titles += [member['title'] for member in data['query']['categorymembers']]
        if 'continue' not in data:
            return titles
        params = {**params, **data['continue']}


def get_article(title):
    data = _get({
        'action': 'query',
        'titles': title,
        'prop': 'extracts|pageimages|info',
        'exintro': 1,
        'explaintext': 1,
        'piprop': 'name',
        'inprop': 'url',
        'redirects': 1,
    })
    page = data['query']['pages'][0]
    text = page.get('extract', '')
    if page.get('missing') or len(text) < MIN_TEXT_LENGTH:
        return None

    image = _get_image(page['pageimage']) if 'pageimage' in page else None
    return {
        'title': page['title'],
        'text': text,
        'url': page['fullurl'],
        'source_name': 'Wikipedia',
        'text_license': 'CC BY-SA 4.0',
        'image_url': image['url'] if image else '',
        'image_attribution': image['attribution'] if image else '',
        'image_license': image['license'] if image else '',
    }


def _get_image(file_name):
    data = _get({
        'action': 'query',
        'titles': f'File:{file_name}',
        'prop': 'imageinfo',
        'iiprop': 'url|extmetadata',
        'iiurlwidth': IMAGE_WIDTH,
    })
    info = data['query']['pages'][0].get('imageinfo')
    if not info:
        return None

    meta = info[0].get('extmetadata', {})
    license_name = meta.get('LicenseShortName', {}).get('value', '')
    non_free = meta.get('NonFree', {}).get('value', '') == 'true'
    attribution = unescape(strip_tags(meta.get('Artist', {}).get('value', ''))).strip()[:300]

    if non_free or not is_allowed(license_name):
        return None
    if license_name.upper().startswith('CC BY') and not attribution:
        return None

    return {
        'url': info[0].get('thumburl', info[0]['url']),
        'license': license_name,
        'attribution': attribution,
    }