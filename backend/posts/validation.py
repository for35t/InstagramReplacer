import re

NUMBER_PATTERN = re.compile(r'\d[\d,.]*\d|\d')


def _numbers(text):
    return {match.replace(',', '') for match in NUMBER_PATTERN.findall(text)}


def missing_numbers(fact, source):
    return _numbers(fact) - _numbers(source)