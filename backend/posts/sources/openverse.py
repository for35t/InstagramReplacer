import random
import requests
from .common import HEADERS
from .licenses import is_allowed

API_URL = 'https://api.openverse.org/v1/images/'
NO_ATTRIBUTION_NEEDED = {'cc0', 'pdm'}


def _license_name(code, version):
    if code == 'cc0':
        return 'CC0'
    if code == 'pdm':
        return 'Public Domain'
    return f'CC {code.upper()} {version}'.strip()


def search_image(query):
    response = requests.get(
        API_URL,
        params={
            'q': query,
            'license_type': 'commercial,modification',
            'aspect_ratio': 'tall',
            'page_size': 20,
        },
        headers=HEADERS,
        timeout=10,
    )
    response.raise_for_status()
    results = response.json().get('results', [])
    random.shuffle(results)

    for result in results:
        code = result.get('license', '')
        license_name = _license_name(code, result.get('license_version') or '')
        creator = (result.get('creator') or '').strip()
        if not is_allowed(license_name):
            continue
        if code not in NO_ATTRIBUTION_NEEDED and not creator:
            continue
        return {
            'url': result['url'],
            'attribution': creator[:300],
            'license': license_name,
            'source_url': result.get('foreign_landing_url') or '',
        }
    return None