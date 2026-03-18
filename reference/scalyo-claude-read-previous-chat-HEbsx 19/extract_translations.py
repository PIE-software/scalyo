#!/usr/bin/env python3
"""
Extract and consolidate translations from index.html
Merges three JavaScript objects (L, MODAL_I18N, T) into JSON files
"""

import re
import json

def parse_js_object_to_dict(content, start_marker, end_marker):
    """Extract a JavaScript object and convert to Python dict"""
    start_idx = content.find(start_marker)
    if start_idx == -1:
        return {}

    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        return {}

    js_block = content[start_idx:end_idx + len(end_marker)]

    # Extract the three language sections
    result = {}
    for lang in ['fr', 'en', 'kr']:
        lang_pattern = rf'{lang}:\s*\{{([^}}]+(?:\}}[^}}]+)*)\}}'
        match = re.search(lang_pattern, js_block, re.DOTALL)
        if match:
            lang_content = match.group(1)
            result[lang] = parse_key_values(lang_content)

    return result

def parse_key_values(content):
    """Parse JavaScript key:value pairs into Python dict"""
    result = {}

    # Match key:'value' or key:"value" or key:value patterns
    # Handle multiline values and escaped quotes
    pattern = r'''(\w+)\s*:\s*(['"])((?:\\.|(?!\2).)*?)\2|(\w+)\s*:\s*([^,}\n]+)'''

    matches = re.finditer(pattern, content)
    for match in matches:
        if match.group(1):  # Quoted value
            key = match.group(1)
            value = match.group(3)
            # Unescape quotes
            value = value.replace(r"\'", "'").replace(r'\"', '"')
            result[key] = value
        elif match.group(4):  # Unquoted value (numbers, booleans, etc.)
            key = match.group(4)
            value = match.group(5).strip().rstrip(',')
            # Convert numbers and booleans
            if value.isdigit():
                result[key] = int(value)
            elif value.replace('.', '', 1).isdigit():
                result[key] = float(value)
            elif value in ['true', 'false']:
                result[key] = value == 'true'
            elif value and value != 'null':
                result[key] = value

    return result

def main():
    # Read the index.html file
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the three translation objects
    print("Extracting object L...")
    L = parse_js_object_to_dict(content, 'const L = {', '};')

    print("Extracting object MODAL_I18N...")
    MODAL_I18N = parse_js_object_to_dict(content, 'var MODAL_I18N = {', '};')

    print("Extracting object T...")
    T = parse_js_object_to_dict(content, 'var T = {', '};')

    # Merge translations by language
    translations = {}
    for lang in ['fr', 'en', 'kr']:
        translations[lang] = {}

        # Merge in order: L, MODAL_I18N, T
        if lang in L:
            translations[lang].update(L[lang])
        if lang in MODAL_I18N:
            translations[lang].update(MODAL_I18N[lang])
        if lang in T:
            translations[lang].update(T[lang])

    # Write to JSON files
    print("\nWriting JSON files...")
    import os
    os.makedirs('refactored/i18n', exist_ok=True)

    for lang in ['fr', 'en', 'kr']:
        filename = f'refactored/i18n/{lang}.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(translations[lang], f, ensure_ascii=False, indent=2)
        print(f"  [OK] {filename} ({len(translations[lang])} keys)")

    print("\nDone! Translation files created successfully.")

if __name__ == '__main__':
    main()
