import re

ALLOWED_PREFIXES = ('CC0', 'PUBLIC DOMAIN', 'PD', 'CC BY')
BLOCKED_TERMS = {'NC', 'ND'}


def is_allowed(license_name):
    name = license_name.strip().upper()
    tokens = set(re.split(r'[\s\-]+', name))
    if tokens & BLOCKED_TERMS:
        return False
    return name.startswith(ALLOWED_PREFIXES)