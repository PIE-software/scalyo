#!/usr/bin/env python3
"""
Extract translations from app.html I18N object
The I18N object has three sections: fr, en, kr (lines 436-1515)
"""

import re
import json
import os

def parse_translation_section(lines):
    """
    Parse a translation section (fr/en/kr) from JavaScript object notation
    Returns a dictionary of key-value pairs
    """
    translations = {}

    # Join all lines into one string for easier parsing
    content = ' '.join(line.strip() for line in lines)

    # Remove the opening brace if present
    content = re.sub(r'^\s*(fr|en|kr)\s*:\s*\{', '', content)
    # Remove trailing closing brace and comma
    content = re.sub(r'\},?\s*$', '', content)

    # Pattern to match key:"value" or key:'value' pairs
    # This handles escaped quotes and multiline values
    pattern = r'(\w+)\s*:\s*(["\'])([^\2]*?(?:\\\2[^\2]*?)*)\2'

    matches = re.finditer(pattern, content)
    for match in matches:
        key = match.group(1)
        value = match.group(3)
        # Unescape quotes
        value = value.replace(r'\"', '"').replace(r"\'", "'")
        translations[key] = value

    return translations

def extract_app_translations(input_file, output_dir):
    """
    Extract I18N translations from app.html
    """
    print(f"Reading {input_file}...")

    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # I18N object: lines 436-1515 (0-indexed: 435-1514)
    # fr: 437-811 (436-810)
    # en: 812-1119 (811-1118)
    # kr: 1120-1514 (1119-1513)

    fr_lines = lines[436:811]  # 437-811
    en_lines = lines[811:1119]  # 812-1119
    kr_lines = lines[1119:1514]  # 1120-1514

    print("Parsing French translations...")
    fr_trans = parse_translation_section(fr_lines)
    print(f"  Found {len(fr_trans)} French keys")

    print("Parsing English translations...")
    en_trans = parse_translation_section(en_lines)
    print(f"  Found {len(en_trans)} English keys")

    print("Parsing Korean translations...")
    kr_trans = parse_translation_section(kr_lines)
    print(f"  Found {len(kr_trans)} Korean keys")

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # Write JSON files
    for lang, trans in [('fr', fr_trans), ('en', en_trans), ('kr', kr_trans)]:
        filename = os.path.join(output_dir, f'{lang}_app.json')
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(trans, f, ensure_ascii=False, indent=2, sort_keys=True)
        print(f"  [OK] {filename} ({len(trans)} keys)")

    return fr_trans, en_trans, kr_trans

def main():
    input_file = "app.html"
    output_dir = "refactored/i18n"

    print("=" * 60)
    print("Scalyo App Translations Extraction")
    print("=" * 60)
    print()

    fr, en, kr = extract_app_translations(input_file, output_dir)

    print("\nExtraction complete!")
    print(f"Output directory: {output_dir}/")
    print("\nFiles created:")
    print(f"  - fr_app.json ({len(fr)} keys)")
    print(f"  - en_app.json ({len(en)} keys)")
    print(f"  - kr_app.json ({len(kr)} keys)")

if __name__ == '__main__':
    main()
