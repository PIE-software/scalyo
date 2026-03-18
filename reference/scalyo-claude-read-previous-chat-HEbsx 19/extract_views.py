#!/usr/bin/env python3
"""
Extract React view components from app.html into separate files
Each view will be extracted as a standalone JSX module
"""

import re
import os

# Define all views with their starting line numbers
VIEWS = [
    ("LoginScreen", 1971),
    ("RoadmapView", 3345),
    ("DashboardView", 3566),
    ("PortfolioView", 4955),
    ("KanbanBoardView", 5552),
    ("TaskBoardView", 5635),
    ("UnifiedTaskBoard", 5817),
    ("PlanningView", 5906),
    ("WellbeingView", 6544),
    ("ResourcesView", 8634),
    ("EmailStudioView", 9460),
    ("KPIView", 9685),
    ("CoachIAView", 12679),
    ("SettingsView", 13003),
    ("TipsView", 13727),
    ("QuotesView", 13779),
    ("FeedbackView", 14041),
]

def find_component_end(lines, start_idx, component_name):
    """
    Find where a React component definition ends by counting braces
    """
    # Start from the component definition line
    brace_count = 0
    in_component = False

    for i in range(start_idx, len(lines)):
        line = lines[i]

        # Skip the component declaration line to start counting from the function body
        if not in_component and '= ({' in line or '= (' in line:
            in_component = True

        if in_component:
            # Count opening and closing braces
            brace_count += line.count('{') - line.count('}')

            # Component ends when braces balance and we find a semicolon or closing
            if brace_count == 0 and (';' in line or i > start_idx + 5):
                return i + 1

    return len(lines)  # Fallback to end of file

def extract_views(input_file, output_dir):
    """
    Extract each view component from app.html into separate files
    """
    print(f"Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    print(f"Total lines: {len(lines)}\n")

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # Extract each view
    for i, (view_name, start_line) in enumerate(VIEWS):
        # Convert to 0-indexed
        start_idx = start_line - 1

        # Determine end line (next component start or file end)
        if i < len(VIEWS) - 1:
            next_start = VIEWS[i + 1][1] - 1
            end_idx = next_start
        else:
            # Last component - find its end by brace counting
            end_idx = find_component_end(lines, start_idx, view_name)

        # Extract the component
        component_lines = lines[start_idx:end_idx]

        # Create filename (convert PascalCase to kebab-case)
        filename = re.sub(r'(?<!^)(?=[A-Z])', '-', view_name).lower()
        output_path = os.path.join(output_dir, f"{filename}.jsx")

        # Add file header
        header = f"""/**
 * Scalyo - {view_name}
 * Extracted from app.html (lines {start_line}-{end_idx + 1})
 */

"""

        # Write to file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(header)
            f.writelines(component_lines)

        lines_count = end_idx - start_idx
        print(f"  [OK] {filename}.jsx ({lines_count} lines, {start_line}-{end_idx + 1})")

    print(f"\nExtracted {len(VIEWS)} views to {output_dir}/")

def create_index_file(output_dir):
    """
    Create an index.js file that exports all views
    """
    index_path = os.path.join(output_dir, 'index.js')

    with open(index_path, 'w', encoding='utf-8') as f:
        f.write("/**\n")
        f.write(" * Scalyo Views - Index\n")
        f.write(" * Central export file for all view components\n")
        f.write(" */\n\n")

        for view_name, _ in VIEWS:
            filename = re.sub(r'(?<!^)(?=[A-Z])', '-', view_name).lower()
            f.write(f"export {{ default as {view_name} }} from './{filename}.jsx';\n")

    print(f"\n[OK] Created index.js")

def create_views_manifest(output_dir):
    """
    Create a manifest documenting all views
    """
    manifest_path = os.path.join(output_dir, 'VIEWS_MANIFEST.md')

    with open(manifest_path, 'w', encoding='utf-8') as f:
        f.write("# Scalyo Views Manifest\n\n")
        f.write("## Extracted View Components\n\n")
        f.write("| View | File | Original Lines | Description |\n")
        f.write("|------|------|----------------|-------------|\n")

        for i, (view_name, start_line) in enumerate(VIEWS):
            if i < len(VIEWS) - 1:
                end_line = VIEWS[i + 1][1] - 1
            else:
                end_line = 15005

            filename = re.sub(r'(?<!^)(?=[A-Z])', '-', view_name).lower()
            line_count = end_line - start_line

            # Add descriptions based on view name
            descriptions = {
                "LoginScreen": "User authentication and login interface",
                "DashboardView": "Main dashboard with KPIs and overview",
                "PortfolioView": "Client portfolio management and account list",
                "RoadmapView": "90-day roadmap planning",
                "UnifiedTaskBoard": "Task management with Kanban/Sprint modes",
                "PlanningView": "Calendar and event planning",
                "KPIView": "KPI tracking and reporting",
                "WellbeingView": "Team wellbeing tracking and burnout alerts",
                "ResourcesView": "CS resources library and playbooks",
                "EmailStudioView": "Email template generation",
                "CoachIAView": "AI Customer Success coach chat interface",
                "SettingsView": "Application settings and preferences",
                "TipsView": "CS tips and best practices",
                "QuotesView": "Quote generation for renewals/expansions",
                "FeedbackView": "User feedback collection",
                "KanbanBoardView": "Kanban board component",
                "TaskBoardView": "Task board component",
            }

            desc = descriptions.get(view_name, "View component")

            f.write(f"| {view_name} | `{filename}.jsx` | {start_line}-{end_line} (~{line_count} lines) | {desc} |\n")

        f.write("\n## Usage\n\n")
        f.write("```javascript\n")
        f.write("// Import individual views\n")
        f.write("import DashboardView from './views/dashboard-view.jsx';\n")
        f.write("import PortfolioView from './views/portfolio-view.jsx';\n\n")
        f.write("// Or import all at once\n")
        f.write("import { DashboardView, PortfolioView, SettingsView } from './views';\n")
        f.write("```\n\n")
        f.write("## View Dependencies\n\n")
        f.write("All views depend on:\n")
        f.write("- React (v18.2.0)\n")
        f.write("- Shared utilities from `../shared/`\n")
        f.write("- i18n translations from `../i18n/`\n")
        f.write("- Supabase client\n")

    print(f"[OK] Created VIEWS_MANIFEST.md\n")

def main():
    input_file = "app.html"
    output_dir = "refactored/views"

    print("=" * 60)
    print("Scalyo View Extraction")
    print("=" * 60)
    print()

    extract_views(input_file, output_dir)
    create_index_file(output_dir)
    create_views_manifest(output_dir)

    print("\nDone! All views extracted successfully.")
    print(f"Output directory: {output_dir}/")

if __name__ == '__main__':
    main()
