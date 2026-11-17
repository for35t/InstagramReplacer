import requests
from django.utils.html import strip_tags
from .licenses import is_allowed

WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'
COMMONS_API = 'https://commons.wikimedia.org/w/api.php'
from .common import HEADERS
MIN_TEXT_LENGTH = 300
IMAGE_WIDTH = 1080
IMAGE_INFO = {'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': IMAGE_WIDTH}


def _get(params, api_url=WIKIPEDIA_API):
    params = {**params, 'format': 'json', 'formatversion': 2}
    response = requests.get(api_url, params=params, headers=HEADERS, timeout=10)
    response.raise_for_status()
    return response.json()


def get_category_titles(category):
    data = _get({
        'action': 'query',
        'list': 'categorymembers',
        'cmtitle': f'Category:{category}',
        'cmtype': 'page',
        'cmlimit': 500,
    })
    return [member['title'] for member in data['query']['categorymembers']]


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

    return {
        'title': page['title'],
        'text': text,
        'url': page['fullurl'],
        'source_name': 'Wikipedia',
        'text_license': 'CC BY-SA 4.0',
        'image': _get_file_image(page['pageimage']) if 'pageimage' in page else None,
    }


def search_commons_image(query):
    data = _get({
        'action': 'query',
        'generator': 'search',
        'gsrsearch': f'{query} filetype:bitmap',
        'gsrnamespace': 6,
        'gsrlimit': 10,
        **IMAGE_INFO,
    }, api_url=COMMONS_API)
    pages = sorted(data.get('query', {}).get('pages', []), key=lambda page: page.get('index', 0))
    for page in pages:
        image = _parse_image(page)
        if image:
            return image
    return None


def _get_file_image(file_name):
    data = _get({'action': 'query', 'titles': f'File:{file_name}', **IMAGE_INFO})
    return _parse_image(data['query']['pages'][0])


def _parse_image(page):
    info = page.get('imageinfo')
    if not info:
        return None

    meta = info[0].get('extmetadata', {})
    license_name = meta.get('LicenseShortName', {}).get('value', '')
    non_free = meta.get('NonFree', {}).get('value', '') == 'true'
    attribution = strip_tags(meta.get('Artist', {}).get('value', '')).strip()[:300]

    if non_free or not is_allowed(license_name):
        return None
    if license_name.upper().startswith('CC BY') and not attribution:
        return None

    return {
        'url': info[0].get('thumburl', info[0]['url']),
        'attribution': attribution,
        'license': license_name,
        'source_url': info[0].get('descriptionurl', ''),
    }